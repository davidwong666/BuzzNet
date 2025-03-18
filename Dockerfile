FROM ubuntu:24.04

# Set Hong Kong timezone
ENV TZ=Asia/Hong_Kong
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install basic development tools
RUN apt-get update && apt-get install -y \
    git curl sudo \
    nodejs npm \
    # python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Create a user account in this development environment for security and convenience reasons
RUN useradd -m developer && \
    echo "developer ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/developer

WORKDIR /app
USER developer
CMD ["bash"]
