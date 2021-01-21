#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2020  Martin Bednar
# SPDX-License-Identifier: GPL-3.0-or-later
#

from subprocess import Popen
from time import sleep

from configuration import Config


## Start Selenium Grid server as a new process on background.
def start_server():
    start_server_command = ['java', '-jar', Config.selenium_server_jar_path, '-role', 'hub']
    server = Popen(start_server_command)
    sleep(6)
    return server


## Start Selenium Grid Nodes as a new processes.
def start_nodes():
    start_node_command = ['java', '-Dwebdriver.chrome.driver=' + Config.chrome_driver_path, '-jar', Config.selenium_server_jar_path, '-role', 'node', '-hub', 'https://' + Config.grid_server_ip_address + ':4444/grid/register/']
    nodes = []
    if Config.number_of_grid_nodes_on_this_device == 0:
        # Waiting on distributed environment when all Selenium Grid nodes will be running.
        input("When all testing nodes will be running, press Enter to start JSR system testing.")
    else:
        for node_number in range(Config.number_of_grid_nodes_on_this_device):
            nodes.append(Popen(start_node_command))
            sleep(7)
    return nodes


## End nodes when testing is finished.
def end_nodes(nodes, manually):
    if manually:
        input("After testing, press Enter to end the nodes.")
    for node in nodes:
        node.kill()


## End Selenium Grid server when testing is finished and all nodes are terminated.
def end_server(server):
    server.kill()
