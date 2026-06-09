"""
背景移除引擎 - 使用 BiRefNet / rembg
自动抠图，支持批量处理
"""

import os
import torch
import torch.nn.functional as F
from PIL import Image
import numpy as np
from typing import Union, List, Tuple
import tempfile

class BackgroundRemover:
    """背景移除引擎"""
    
    def __init__(self, use_birefnet: bool = False):
        """
        Args:
            use_birefnet: 是否使用 BiRefNet（更精确但较慢），否则使用 rembg（更快）
        """
        self.use_birefnet = use_birefnet
        self.model = None
        
        if use_birefnet:
            # 加载 BiRefNet 模型
            try:
                from birefnet import BiRefNet
                self.model = BiRefNet.from_pretrained("ZhengPeng7/BiRefNet")
                self.model.eval()
                if torch.cuda.is_available():
                    self.model = self.model.cuda()
            except ImportError:
                print("BiRefNet not available, falling back to rembg")
                self.use_birefnet = False
        
        if not self.use_birefnet:
            # 使用 rembg
            try:
                from rembg import remove
                self.rembg_remove = remove
            except ImportError:
                raise ImportError("Neither BiRefNet nor rembg is available. Please install one of them.")
    
    def remove_background(self, image_path: str, output_path: str) -> str:
        """
        移除图片背景
        
        Args:
            image_path: 输入图片路径
            output_path: 输出路径
            
        Returns:
            output_path: 输出文件路径
        """
        if self.use_birefnet and self.model:
            return self._remove_with_birefnet(image_path, output_path)
        else:
            return self._remove_with_rembg(image_path, output_path)
    
    def _remove_with_rembg(self, image_path: str, output_path: str) -> str:
        """使用 rembg 移除背景"""
        with open(image_path, "rb") as f:
            input_data = f.read()
        
        output_data = self.rembg_remove(input_data)
        
        with open(output_path, "wb") as f:
            f.write(output_data)
        
        return output_path
    
    def _remove_with_birefnet(self, image_path: str, output_path: str) -> str:
        """使用 BiRefNet 移除背景"""
        # 加载图片
        image = Image.open(image_path).convert("RGB")
        
        # 预处理
        orig_size = image.size
        image = image.resize((1024, 1024))
        
        # 转换为 tensor
        img_tensor = torch.from_numpy(np.array(image)).float() / 255.0
        img_tensor = img_tensor.permute(2, 0, 1).unsqueeze(0)
        
        if torch.cuda.is_available():
            img_tensor = img_tensor.cuda()
        
        # 推理
        with torch.no_grad():
            mask = self.model(img_tensor)
            mask = F.interpolate(mask, size=orig_size[::-1], mode="bilinear", align_corners=False)
            mask = mask.squeeze().cpu().numpy()
        
        # 应用掩码
        image_orig = Image.open(image_path).convert("RGBA")
        mask_img = Image.fromarray((mask * 255).astype(np.uint8))
        mask_img = mask_img.resize(orig_size)
        
        image_orig.putalpha(mask_img)
        image_orig.save(output_path)
        
        return output_path
    
    def replace_background(self, image_path: str, output_path: str, 
                          background: Union[str, Tuple[int, int, int]]) -> str:
        """
        替换背景
        
        Args:
            image_path: 输入图片路径
            output_path: 输出路径
            background: 背景颜色 (R, G, B) 或背景图片路径
        """
        # 先移除背景
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, "nobg.png")
        self.remove_background(image_path, temp_path)
        
        # 打开透明图片
        foreground = Image.open(temp_path).convert("RGBA")
        
        # 创建背景
        if isinstance(background, str) and os.path.exists(background):
            # 使用背景图片
            bg = Image.open(background).convert("RGBA")
            bg = bg.resize(foreground.size)
        else:
            # 使用纯色背景
            if isinstance(background, tuple):
                color = background
            else:
                color = (255, 255, 255)  # 默认白色
            bg = Image.new("RGBA", foreground.size, (*color, 255))
        
        # 合成
        result = Image.alpha_composite(bg, foreground)
        result = result.convert("RGB")
        result.save(output_path)
        
        return output_path

# 批量处理
def batch_remove_background(input_dir: str, output_dir: str):
    """批量移除背景"""
    os.makedirs(output_dir, exist_ok=True)
    remover = BackgroundRemover()
    
    results = []
    for filename in os.listdir(input_dir):
        if filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, f"nobg_{filename}")
            try:
                remover.remove_background(input_path, output_path)
                results.append({"input": filename, "output": output_path, "status": "success"})
            except Exception as e:
                results.append({"input": filename, "error": str(e), "status": "failed"})
    
    return results
