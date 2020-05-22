# Go to common scripts directory.
cd ../common_files/scripts

# Set executable permissions.
chmod +x ./build_JSR_package.sh
chmod +x ../webbrowser_drivers/chromedriver
chmod +x ../webbrowser_drivers/geckodriver

# Run script build_JSR_package.sh
./build_JSR_package.sh

# Go to JSR project root directory directory and save PWD.
cd ../../../
JSRPath=`pwd`

# Go back to integration_tests directory.
cd ./tests/integration_tests

#Automatically set JSR project root directory path in configuration.py.
sed -i "s@<<JSR_project_root_directory_path>>@${JSRPath}@g" ./configuration.py

#Remove all exe suffix of binary file names. Linux binaries will be then use.
sed -i "s@.exe@@g" ./configuration.py
