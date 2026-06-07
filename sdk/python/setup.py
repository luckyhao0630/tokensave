from setuptools import setup, find_packages

setup(
    name="tokensaver",
    version="0.1.0",
    description="TokenSaver Python SDK - Smart LLM Token Compression",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="TokenSaver Team",
    url="https://tokesave.com",
    py_modules=["tokensaver"],
    install_requires=[],
    python_requires=">=3.7",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
)