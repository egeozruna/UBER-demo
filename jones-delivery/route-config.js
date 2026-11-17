'use strict';

// Edit this file after the site visit. Coordinates are [longitude, latitude].
// A/B are mapped door candidates, C and D are placeholders; none is field-verified.
// Keep route endpoints and step indices aligned when changing the route.
window.JONES_DELIVERY = {
  "version": "jones-north-lobby-1",
  "verified": false,
  "start": {
    "name": "Meeting point \u00b7 Academic Quad",
    "coordinates": [
      -95.3988409,
      29.7186112
    ],
    "note": "Provisional meeting point in the Academic Quad; confirm the same point for both test groups."
  },
  "destination": {
    "name": "Jones College",
    "coordinates": [
      -95.39696478,
      29.72151172
    ]
  },
  "recommendedEntrance": "C",
  "entrances": [
    {
      "id": "A",
      "name": "Courtyard entrance",
      "coordinates": [
        -95.3969546,
        29.7214912
      ],
      "note": "Central / commons building, courtyard side. Not the entrance for this North Wing lobby delivery.",
      "source": "OpenStreetMap entrance node 8388294692"
    },
    {
      "id": "B",
      "name": "East-side entrance",
      "coordinates": [
        -95.3966925,
        29.7214629
      ],
      "note": "Alternative entrance on the opposite side. Not the delivery entrance for this draft. Confirm access on site.",
      "source": "OpenStreetMap entrance node 8388335033"
    },
    {
      "id": "C",
      "name": "North-wing entrance",
      "coordinates": [
        -95.39712334,
        29.7217526
      ],
      "note": "Use the North Wing courtyard-side entrance for the lobby delivery. This door position and access still need confirmation on site.",
      "source": "Editable placeholder; not a verified doorway"
    }
  ],
  "dropoff": {
    "id": "D",
    "name": "North Wing lobby",
    "coordinates": [
      -95.39712189,
      29.72179383
    ],
    "note": "Meet the customer in the North Wing lobby at D, through entrance C. The lobby pin is approximate; confirm the exact hand-off spot and access on site.",
    "photo": "",
    "photoAlt": "North Wing lobby delivery spot",
    "shortLabel": "North lobby"
  },
  "sections": [
    {
      "name": "North wing",
      "coordinates": [
        -95.39721272,
        29.72181003
      ],
      "heightFeet": 67
    },
    {
      "name": "Central / commons",
      "coordinates": [
        -95.39680442,
        29.72158994
      ],
      "heightFeet": 65
    },
    {
      "name": "South wing",
      "coordinates": [
        -95.39679824,
        29.72122935
      ],
      "heightFeet": 67
    }
  ],
  "views": [
    {
      "id": "approach",
      "label": "Approach",
      "heading": 38,
      "tilt": 63,
      "scale": 1650
    },
    {
      "id": "courtyard",
      "label": "Courtyard",
      "heading": 90,
      "tilt": 63,
      "scale": 1500
    },
    {
      "id": "overhead",
      "label": "Overhead",
      "heading": 0,
      "tilt": 5,
      "scale": 1600
    }
  ],
  "route": {
    "coordinates": [
      [
        -95.3988409,
        29.7186112
      ],
      [
        -95.3988359,
        29.7186298
      ],
      [
        -95.3988272,
        29.7186629
      ],
      [
        -95.3988246,
        29.718709
      ],
      [
        -95.3988385,
        29.7187854
      ],
      [
        -95.3988624,
        29.7188312
      ],
      [
        -95.3988667,
        29.7188394
      ],
      [
        -95.3988719,
        29.7188494
      ],
      [
        -95.398907,
        29.7189168
      ],
      [
        -95.3990079,
        29.7191105
      ],
      [
        -95.3991078,
        29.7193023
      ],
      [
        -95.3992176,
        29.7194096
      ],
      [
        -95.3992635,
        29.7194474
      ],
      [
        -95.3993067,
        29.7195142
      ],
      [
        -95.3980282,
        29.7200274
      ],
      [
        -95.3979392,
        29.7200623
      ],
      [
        -95.3973496,
        29.7203032
      ],
      [
        -95.3973293,
        29.7203113
      ],
      [
        -95.3972134,
        29.7209557
      ],
      [
        -95.397209,
        29.7209855
      ],
      [
        -95.397202,
        29.7210458
      ],
      [
        -95.3971992,
        29.7210653
      ],
      [
        -95.3971585,
        29.7213712
      ],
      [
        -95.3971549,
        29.7213925
      ],
      [
        -95.3971036,
        29.7216957
      ],
      [
        -95.3970999,
        29.7217174
      ],
      [
        -95.39712334,
        29.7217526
      ],
      [
        -95.39712189,
        29.72179383
      ]
    ],
    "source": "OpenStreetMap pedestrian ways, retrieved 2026-11-17; draft final connection to North Wing entrance C and lobby D.",
    "osmWayIds": [
      "1528606935",
      "87452244",
      "44896171",
      "1051165099",
      "255487614"
    ],
    "entranceIndex": 26
  },
  "steps": [
    {
      "title": "Leave Academic Quad",
      "instruction": "Follow the path between Anderson and Herzstein halls toward Loop Road.",
      "from": 0,
      "to": 13
    },
    {
      "title": "Follow the Loop Road path",
      "instruction": "Turn right and follow the path northeast toward McMurtry College.",
      "from": 13,
      "to": 17
    },
    {
      "title": "Approach Jones courtyard",
      "instruction": "Turn left onto the northbound walkway. Pass the south wing and continue into the courtyard.",
      "from": 17,
      "to": 23
    },
    {
      "title": "Find North Wing entrance C",
      "instruction": "Continue north along the courtyard walkway to the North Wing. Use entrance C for the lobby delivery; confirm this draft door on site.",
      "from": 23,
      "to": 26
    },
    {
      "title": "Meet in the North Wing lobby",
      "instruction": "Go through entrance C and meet the customer in the North Wing lobby at D. The exact lobby spot and access need confirmation on site.",
      "from": 26,
      "to": 27
    }
  ],
  "landmarks": [
    {
      "name": "Anderson Hall",
      "coordinates": [
        -95.39967523,
        29.71884151
      ]
    },
    {
      "name": "Herzstein Hall",
      "coordinates": [
        -95.39852344,
        29.71932505
      ]
    },
    {
      "name": "McMurtry",
      "coordinates": [
        -95.39806944,
        29.72057846
      ]
    }
  ]
};
