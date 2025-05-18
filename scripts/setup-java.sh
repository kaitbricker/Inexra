#!/bin/bash

# Function to check if Java is installed
check_java() {
    if type -p java >/dev/null && java -version 2>&1 | grep -q "version"; then
        echo "Java is already installed:"
        java -version
        return 0
    else
        echo "Java is not installed or not properly configured."
        return 1
    fi
}

# Function to install Java using Homebrew
install_java() {
    echo "Installing Java using Homebrew..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "Homebrew not found. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Install Java
    echo "Installing OpenJDK 17..."
    brew install openjdk@17
    
    # Create a symbolic link to make it available system-wide
    echo "Setting up Java system links..."
    sudo ln -sfn $(brew --prefix)/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
    
    # Add Java to PATH if not already present
    if ! grep -q "JAVA_HOME" ~/.zshrc; then
        echo 'export JAVA_HOME=$(/usr/libexec/java_home)' >> ~/.zshrc
        echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
        source ~/.zshrc
    fi
    
    echo "Java installation completed!"
}

# Main execution
if ! check_java; then
    install_java
fi

# Verify installation
echo "Verifying Java installation..."
java -version 