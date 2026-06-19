#!/bin/bash

# Run tests with coverage
COVERAGE=$(go test ./... -cover | grep -oE '[0-9]+(\.[0-9]+)?%' | tr -d '%')

# Exit if any test fails
if [ $? -ne 0 ]; then
    echo "Tests failed!"
    exit 1
fi

# Check if coverage is 100%
echo "Total Coverage: $COVERAGE%"

for cov in $COVERAGE; do
    if (( $(echo "$cov < 100" | bc -l) )); then
        echo "Coverage is below 100%: $cov%"
        exit 1
    fi
done

echo "100% Coverage achieved!"
exit 0
