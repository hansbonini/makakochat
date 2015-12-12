# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

setup(
    name="makakochat-server",
    version="0.1.0",
    description="WebChat Server for BuddyPress",
    license="MIT",
    author="Hans Bonini, Sandro Dutra",
    packages=find_packages(),
    install_requires=["Flask", "flask-socketio"],
    long_description="Server for MakakoChat",
    classifiers=[
        "Programming Language :: Python",
        "Programming Language :: Python :: 3.5",
    ]
)
