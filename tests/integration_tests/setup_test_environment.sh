# Go to common scripts directory.
cd ../common_files/scripts

# Run script build_JSR_package.sh
./build_JSR_package.sh

# Go to JSR project root directory directory and save PWD.
cd ../../../
JSRPath = pwd

# Go back to integration_tests directory.
cd ./tests/integration_tests

#Automatically set JSR project root directory path in configuration.py.
sed -i "s@<<JSR_project_root_directory_path>>@$(JSRPath)@g" ./configuration.py
