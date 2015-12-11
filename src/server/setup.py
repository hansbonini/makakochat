# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

setup(
    name="makakochat-server",
    version="0.1.0",
    description="WebChat Server for BuddyPress",
    license="GPL-3.0",
    author="Hans Bonini, Sandro Dutra",
    packages=find_packages(),
    install_requires=[flask, flask.socketio],
    long_description=long_description,
    classifiers=[
        "Programming Language :: Python",
        "Programming Language :: Python :: 3.5",
    ]
)
