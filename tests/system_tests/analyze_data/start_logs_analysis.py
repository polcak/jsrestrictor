#
#  JShelter is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2020  Martin Bednar
#
# SPDX-License-Identifier: GPL-3.0-or-later
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

import levenshtein_distance as levenshtein
import cosine_similarity as cosine
import simple_comparison as simple
import io_funcs as io


## Build header of output HTML file.
def html_header():
    return "<html>" \
           "<head><title>Logs comparison</title>" \
           "<style>" \
           "body {background-color: white} " \
           "table {width: 100%; border-collapse: collapse; table-layout: fixed;} " \
           ".added-log {background-color: LightPink} " \
           "h2 {margin-left: 10px;} " \
           "th, td {width: 50%; border: 1px solid black; word-wrap: break-word; padding: 5px;} " \
           ".colored-results-table-visible td {width: 33%; border: none; padding: 5px; color: white; text-align: center;} " \
           ".colored-results-table-visible .method {background-color: red;} " \
           ".colored-results-table {display: none;} " \
           ".colored-results-table-visible {display: table; margin-bottom: 5px} " \
           "</style>" \
           "</head>" \
           "<body><h1>Logs comparison</h1>"


## Build footer of output HTML file.
def html_footer():
    return "<br><br></body></html>"


## Build table with logs for one site. Insert to output HTML file.
def build_site_logs_table(site, site_number):
    output = "<br><h2>" + str(site_number) + ") " + site['site'] + "</h2><table><tr><th>Without JShelter</th><th>With JShelter</th></tr>"
    i = 0
    max_lenght = 0
    if site['logs_with_jsr'] != "ERROR_WHILE_LOADING_THIS_OR_PREVIOUS_PAGE":
        max_lenght = max(len(site['logs_without_jsr']), len(site['logs_with_jsr']))
    else:
        max_lenght = len(site['logs_without_jsr'])
    while i < max_lenght:
        output += "<tr><td>"
        if i < len(site['logs_without_jsr']):
            output += "Level: " + site['logs_without_jsr'][i]['level'] + "<br>"
            output += "Source: " + site['logs_without_jsr'][i]['source'] + "<br>"
            output += "Message: " + site['logs_without_jsr'][i]['message']
        output += "</td><td"
        output_tmp = "><tr>"
        colored_results_table_visible = False
        if site['logs_with_jsr'] != "ERROR_WHILE_LOADING_THIS_OR_PREVIOUS_PAGE":
            if i < len(site['logs_with_jsr']):
                output_tmp += "<td"
                if simple.was_log_added(site['logs_with_jsr'][i], site['logs_without_jsr']):
                    output_tmp += ' class="method">Simple comparison</td><td'
                    colored_results_table_visible = True
                else:
                    output_tmp += "></td><td"
                if levenshtein.was_log_added(site['logs_with_jsr'][i], site['logs_without_jsr']):
                    output_tmp += ' class="method">Levenshtein distance</td><td'
                    colored_results_table_visible = True
                else:
                    output_tmp += "></td><td"
                if cosine.was_log_added(site['logs_with_jsr'][i], site['logs_without_jsr']):
                    output_tmp += ' class="method">Cosine similarity</td>'
                    colored_results_table_visible = True
                else:
                    output_tmp += "></td>"
        if colored_results_table_visible:
            output += ' class="added-log"><table class="colored-results-table-visible"'
        else:
            output += '><table class="colored-results-table"'
        output += output_tmp + '</tr></table>'
        if site['logs_with_jsr'] != "ERROR_WHILE_LOADING_THIS_OR_PREVIOUS_PAGE":
            if i < len(site['logs_with_jsr']):
                output += "Level: " + site['logs_with_jsr'][i]['level'] + "<br>"
                output += "Source: " + site['logs_with_jsr'][i]['source'] + "<br>"
                output += "Message: " + site['logs_with_jsr'][i]['message']
        elif i == 0:
            output += "ERROR_WHILE_LOADING_THIS_OR_PREVIOUS_PAGE"
        output += "</td></tr>"
        i += 1
    output += "</table>"
    return output


## Main function of logs analysis.
def main():
    io.delete_file_if_exists("../data/logs/logs_comparison.html")

    sites_logs = io.get_json_file_content("../data/logs/logs.json")

    output = html_header()
    j = 1
    sites_number = len(sites_logs)
    if sites_number == 0:
        print("No logs for analysis found. Please, include getting logs to configuration and run getting data first.")
    for site in sites_logs:
        print("Site " + str(j) + " of " + str(sites_number) + ": " + site['site'])
        output += build_site_logs_table(site, j)
        j += 1
    output += html_footer()

    io.write_file("../data/logs/logs_comparison.html", output)


if __name__ == "__main__":
    main()
