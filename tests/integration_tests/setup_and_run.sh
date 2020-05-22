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

# Automatically set JSR project root directory path in configuration.py.
sed -i "s@<<JSR_project_root_directory_path>>@${JSRPath}@g" ./testing/configuration.py

# Get path to Firefox ESR default profile.
read -p 'Input path into Firefox ESR default profile directory: ' FFProfile

# Set JSR project root directory path in configuration.py.
sed -i "s@<<Firefox_ESR_default_profile>>@${FFProfile}@g" ./testing/configuration.py

# Remove all exe suffix of binary file names. Linux binaries will be then use.
sed -i "s@.exe@@g" ./testing/configuration.py

# Start testing if everything ok.
read -p "Can you confirm that no error happened during setup? [y/n]: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "You confirmed that an error happened. Integration testing can not be started. Look at the README file and follow instructions to run the setup again."
else
	echo "You confirmed that no error happened. Integration testing is starting..."
	python3 ./testing/start.py
fi
