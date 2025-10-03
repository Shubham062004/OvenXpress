#!/bin/bash

# OvenXpress AWS Deployment Script
# This script deploys the full-stack application to AWS

set -e

# Configuration
STACK_NAME="ovenxpress-stack"
REGION="us-east-1"
KEY_PAIR_NAME="ovenxpress-key"
INSTANCE_TYPE="t3.medium"

echo "🚀 Starting OvenXpress deployment to AWS..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is logged in to AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Not logged in to AWS. Please run 'aws configure' first."
    exit 1
fi

# Create key pair if it doesn't exist
echo "🔑 Checking for key pair..."
if ! aws ec2 describe-key-pairs --key-names $KEY_PAIR_NAME --region $REGION &> /dev/null; then
    echo "Creating key pair..."
    aws ec2 create-key-pair --key-name $KEY_PAIR_NAME --region $REGION --query 'KeyMaterial' --output text > ${KEY_PAIR_NAME}.pem
    chmod 400 ${KEY_PAIR_NAME}.pem
    echo "✅ Key pair created: ${KEY_PAIR_NAME}.pem"
else
    echo "✅ Key pair already exists"
fi

# Deploy CloudFormation stack
echo "☁️ Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file deployment/aws/cloudformation-template.yaml \
    --stack-name $STACK_NAME \
    --parameter-overrides \
        KeyPairName=$KEY_PAIR_NAME \
        InstanceType=$INSTANCE_TYPE \
    --region $REGION \
    --capabilities CAPABILITY_IAM

# Get stack outputs
echo "📋 Getting stack outputs..."
WEB_SERVER_IP=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`WebServerPublicIP`].OutputValue' \
    --output text)

WEB_SERVER_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`WebServerURL`].OutputValue' \
    --output text)

S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
    --output text)

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "====================="
echo "🌐 Web Server IP: $WEB_SERVER_IP"
echo "🔗 Web Server URL: $WEB_SERVER_URL"
echo "📦 S3 Bucket: $S3_BUCKET"
echo "🔑 SSH Key: ${KEY_PAIR_NAME}.pem"
echo ""
echo "🔧 Next Steps:"
echo "1. Update your environment variables with the S3 bucket name"
echo "2. Configure your domain name to point to $WEB_SERVER_IP"
echo "3. Set up SSL certificate for HTTPS"
echo "4. Configure your database connection"
echo ""
echo "🚀 Your application should be accessible at: $WEB_SERVER_URL"
