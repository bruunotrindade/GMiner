# About

**GMiner** (Git Miner) main goal is to collect attributes from merges. New attributes are welcome..<br />

## How to use

To use **GMiner**, you need to have git properly installed on your computer, with the configured environment variable and NodeJS 12.

First of all, you must download the latest version in this page and save all Git.

## Basic instructions

1) Install Node JS 12
2) Use **npm install** in GMiner's folder.
3) Use **npm start** in GMiner's folder.
4) Give some information about the repositories. 

## Using Docker

1) Build GMiner's image:

```shell
docker build -t GMiner .
```

2) Up a container with builded image:

```shell
docker run GMiner
```

Docker image default environment variables:

```shell
DELIMITER=';'
MODE='2'
INPUT_DATA='/usr/src/input/'
OUTPUT_FOLDER='/usr/src/results/'
```

By default, Docker image will start analysis to all repositories inside 'input' folder.

- DELIMITER = Delimiter used in CSV output file.
- MODE = **1** for single repositories by path and **2** for all repositories inside INPUT_DATA folder.
- INPUT_DATA = For mode **1** corresponds to repositories paths separated by semicolon(;).
- OUTPUT_FOLDER = Folder where all CSV will be created.

## Team

- Catarina Costa (joined in Aug 2018)
- Bruno Trindade (joined in Aug 2018)
