#!/bin/bash
cd angular-ms/iot-app

# Bypass confirmation for npx
export npm_config_yes=true

echo "Upgrading to Angular 10..."
npx @angular/cli@10 update @angular/core@10 @angular/cli@10 --force || true
echo "Upgrading to Angular 11..."
npx @angular/cli@11 update @angular/core@11 @angular/cli@11 --force || true
echo "Upgrading to Angular 12..."
npx @angular/cli@12 update @angular/core@12 @angular/cli@12 --force || true
echo "Upgrading to Angular 13..."
npx @angular/cli@13 update @angular/core@13 @angular/cli@13 --force || true
echo "Upgrading to Angular 14..."
npx @angular/cli@14 update @angular/core@14 @angular/cli@14 --force || true
echo "Upgrading to Angular 15..."
npx @angular/cli@15 update @angular/core@15 @angular/cli@15 --force || true

# Update materials etc if present
npx @angular/cli@15 update @angular/material@15 --force || true
