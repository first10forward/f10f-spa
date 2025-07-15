#!/bin/bash

# Variables - Update these with your values
RESOURCE_GROUP="f10f-spa-rg"
APP_NAME="f10f-spa"
LOCATION="eastus"
GITHUB_REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO_NAME"
SUBSCRIPTION_ID="YOUR_SUBSCRIPTION_ID"  # Add your subscription ID here

echo "Logging into Azure and setting subscription..."
az login
az account set --subscription $SUBSCRIPTION_ID

echo "Creating Azure Static Web App..."
echo "Resource Group: $RESOURCE_GROUP"
echo "App Name: $APP_NAME"
echo "Location: $LOCATION"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create static web app
az staticwebapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --source $GITHUB_REPO_URL \
  --location $LOCATION \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github

echo "Deployment initiated! Check the Azure portal for status."
