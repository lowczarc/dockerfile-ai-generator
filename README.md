# Dockerfile AI Generator

I tried to generate dockerfiles using LLMs. For now it kinda works on simple repos but it needs some more work.

## Installation

To install it download this repository and launch:
```bash
yarn build
chmod 755 build/auto-dockerfile
```

The executable is in `./build/auto-dockerfile`. You can install it in your .local/bin if you want to use it.

## Usage

You need to have the `POLYFACT_TOKEN` environement variable set. You can get one here: https://app.polyfact.com, more infos here: https://github.com/polyfact/polyfact-node.

Then just go to the directory you want to generate a dockerfile of and run `auto-dockerfile`.

Your dockerfile is send to the standard output.
