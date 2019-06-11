//
//  JavaScript Restrictor is a browser extension which increases level
//  of security, anonymity and privacy of the user while browsing the
//  internet.
//
//  Copyright (C) 2019  Libor Polcak
//  Copyright (C) 2019  Martin Timko
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

// levels of protection

var level_0 = {
	"level_text": "0",
  "window_date": {
      "main_checkbox": false,
      "time_round_precision": "-1"
  },
  "window_performance_now": {
      "main_checkbox": false,
      "value_round_precision": "-1"
  },
  "window_html_canvas_element": {
      "main_checkbox": false
  },
  "navigator_geolocation": {
      "main_checkbox": false,
      "type_of_restriction": "a",
      "gps_a": "4",
      "gps_b": "4",
      "gps_c": "-1",
      "gps_d": "-1",
      "gps_e": "-1",
      "gps_f": "-1",
      "gps_g": "-1"
  },
  "window_xmlhttprequest": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "user_agent": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "referer": {
      "main_checkbox": false
  },
  "language": {
      "main_checkbox": false
  },
  "hardware": {
      "main_checkbox": false
  },
  "cookie_enabled": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "DNT_enabled": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  }
}
var level_1 = {
	"level_text": "1",
  "window_date": {
      "main_checkbox": true,
      "time_round_precision": "-1"
  },
  "window_performance_now": {
      "main_checkbox": true,
      "value_round_precision": "-1"
  },
  "window_html_canvas_element": {
      "main_checkbox": false
  },
  "navigator_geolocation": {
      "main_checkbox": true,
      "type_of_restriction": "a",
      "gps_a": "2",
      "gps_b": "2",
      "gps_c": "-1",
      "gps_d": "-1",
      "gps_e": "-1",
      "gps_f": "-1",
      "gps_g": "-1"
  },
  "window_xmlhttprequest": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "user_agent": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "referer": {
      "main_checkbox": false
  },
  "language": {
      "main_checkbox": false
  },
  "hardware": {
      "main_checkbox": true
  },
  "cookie_enabled": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "DNT_enabled": {
      "main_checkbox": true,
      "type_of_restriction": "a"
  }
}
var level_2 = {
	"level_text": "2",
  "window_date": {
      "main_checkbox": true,
      "time_round_precision": "-2"
  },
  "window_performance_now": {
      "main_checkbox": true,
      "value_round_precision": "-2"
  },
  "window_html_canvas_element": {
      "main_checkbox": true
  },
  "navigator_geolocation": {
      "main_checkbox": true,
      "type_of_restriction": "a",
      "gps_a": "1",
      "gps_b": "1",
      "gps_c": "-2",
      "gps_d": "-2",
      "gps_e": "-2",
      "gps_f": "-2",
      "gps_g": "-2"
  },
  "window_xmlhttprequest": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "user_agent": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "referer": {
      "main_checkbox": false
  },
  "language": {
      "main_checkbox": false
  },
  "hardware": {
      "main_checkbox": true
  },
  "cookie_enabled": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "DNT_enabled": {
      "main_checkbox": true,
      "type_of_restriction": "a"
  }
}
var level_3 = {
	"level_text": "3",
  "window_date": {
      "main_checkbox": true,
      "time_round_precision": "-3"
  },
  "window_performance_now": {
      "main_checkbox": true,
      "value_round_precision": "-3"
  },
  "window_html_canvas_element": {
      "main_checkbox": true
  },
  "navigator_geolocation": {
      "main_checkbox": true,
      "type_of_restriction": "b",
      "gps_a": "0",
      "gps_b": "0",
      "gps_c": "0",
      "gps_d": "-1",
      "gps_e": "-1",
      "gps_f": "-1",
      "gps_g": "-1"
  },
  "window_xmlhttprequest": {
      "main_checkbox": false,
      "type_of_restriction": "b"
  },
  "user_agent": {
      "main_checkbox": false,
      "type_of_restriction": "b"
  },
  "referer": {
      "main_checkbox": true
  },
  "language": {
      "main_checkbox": true
  },
  "hardware": {
      "main_checkbox": true
  },
  "cookie_enabled": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "DNT_enabled": {
      "main_checkbox": true,
      "type_of_restriction": "a"
  }
}
//
// default extension_settings_data setting. used on install
var extension_settings_data = {
	"level_text": "C",
  "window_date": {
      "main_checkbox": false,
      "time_round_precision": "-3"
  },
  "window_performance_now": {
      "main_checkbox": false,
      "value_round_precision": "-3"
  },
  "window_html_canvas_element": {
      "main_checkbox": false
  },
  "navigator_geolocation": {
      "main_checkbox": false,
      "type_of_restriction": "a",
      "gps_a": "0",
      "gps_b": "0",
      "gps_c": "0",
      "gps_d": "-1",
      "gps_e": "-1",
      "gps_f": "-1",
      "gps_g": "-1"
  },
  "window_xmlhttprequest": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "user_agent": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "referer": {
      "main_checkbox": false
  },
  "language": {
      "main_checkbox": false
  },
  "hardware": {
      "main_checkbox": false
  },
  "cookie_enabled": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  },
  "DNT_enabled": {
      "main_checkbox": false,
      "type_of_restriction": "a"
  }
}

// Level aliases
const L0 = 0;
const L1 = 1;
const L2 = 2;
const L3 = 3;
const LC = 4;	// custom
const LD = 5;	// default

var levels = [level_0, level_1, level_2, level_3]

browser.storage.sync.get(null, function (res) {
	var custom_level = res.extension_settings_data;
	custom_level["level_text"] = "C";
	levels[LC] = custom_level;
});

function getCurrentLevelJSON(level) {
	return levels[level];
}
