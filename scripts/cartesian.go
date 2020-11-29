package main

import (
	"fmt"
	"strings"
)

var levels = []string{
	//"h1",
	//"h2.1",
	//"h2.2",
	//"h2.3",

	//"m1",
	//"m2.1",
	//"m2.2",
	//"m2.3",

	//"l1",
	//"l2.1",
	//"l2.2",
	//"l2.3",
	"strobe1.1",
	"strobe1.2",
	"strobe1.3",
	"strobe1.4",
}

var states = []string{
	//"cycle_strobe_beat",
	//"cycle_pre_battery_indicator",

	//"toggle_intermediate_1",
	//"toggle_1",
	//"toggle_intermediate_2",
	//"toggle_2",
	//"toggle_intermediate_3",
	//"toggle_3",
	//"toggle_intermediate_4",
	//"toggle_4",
	//"toggle_intermediate_5",
	//"toggle_5",
	//"toggle_intermediate_6",
	//"toggle_6",
	//"toggle_intermediate_7",

	"subcycle_intermediate",
	"subcycle",
}

var components = [][]string{
	levels,
	states,
}

func cartesian(prefix string, componentSetIndex int) {
	for _, component := range components[componentSetIndex] {
		combinedString := prefix
		if combinedString != "" {
			combinedString += "."
		}
		combinedString += component

		if componentSetIndex == len(components)-1 {
			fmt.Printf(
				"  %v: '%v',\n",
				strings.ReplaceAll(strings.ToUpper(combinedString), ".", "_"),
				combinedString,
			)
		} else {
			cartesian(combinedString, componentSetIndex+1)
		}
	}
}

func main() {
	cartesian("", 0)
}
