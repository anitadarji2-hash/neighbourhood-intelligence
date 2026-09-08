/* =========================================================
   NEIGHBOURHOOD INTELLIGENCE
   MAIN JAVASCRIPT
   ========================================================= */


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let neighbourhoodData = [];

let charts = {};

let planningMap = null;


/* =========================================================
   DATA FILE
   ========================================================= */

const DATA_FILE = "planning.csv";

/* =========================================================
   AMENITY COLUMNS
   ========================================================= */

const amenityColumns = [

    {
        key: "Healthcare_Score",
        label: "Healthcare"
    },

    {
        key: "Education_Score",
        label: "Education"
    },

    {
        key: "Food_Score",
        label: "Food"
    },

    {
        key: "Finance_Score",
        label: "Finance"
    },

    {
        key: "Green_Score",
        label: "Green"
    },

    {
        key: "Hospitality_Score",
        label: "Hospitality"
    },

    {
        key: "Transit_Score",
        label: "Transit"
    },

    {
        key: "Shopping_Score",
        label: "Shopping"
    },

    {
        key: "Business_Score",
        label: "Business"
    }

];


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadPlanningData();

        setupNavigation();

        setupScrollButtons();

    }
);


/* =========================================================
   LOAD CSV DATA
   ========================================================= */

function loadPlanningData() {

    const status =
        document.getElementById(
            "dataStatus"
        );


    fetch(DATA_FILE)

        .then(
            response => {

                if (!response.ok) {

                    throw new Error(
                        "Could not load planning.csv"
                    );

                }

                return response.text();

            }
        )

        .then(
            csvText => {

                Papa.parse(
                    csvText,
                    {

                        header: true,

                        skipEmptyLines: true,

                        complete: function (results) {

                            neighbourhoodData =
                                results.data
                                    .map(cleanRow)
                                    .filter(
                                        row =>
                                            row.Neighborhood
                                    );


                            console.log(
                                "Planning data loaded:",
                                neighbourhoodData
                            );


                            if (status) {

                                status.textContent =
                                    `Data loaded · ${neighbourhoodData.length} neighbourhoods`;

                            }


                            initialiseDashboard();

                        }

                    }
                );

            }
        )

        .catch(
            error => {

                console.error(
                    "Data loading error:",
                    error
                );


                if (status) {

                    status.textContent =
                        "Unable to load planning data";

                }

            }
        );

}


/* =========================================================
   CLEAN CSV ROW
   ========================================================= */

function cleanRow(row) {

    const cleaned = {};


    const numericColumns = [

        "Population",

        "Predicted_Growth_2025_Pct",

        "Predicted_Population_2025",

        "Growth_Rank",

        "Healthcare_Score",

        "Education_Score",

        "Food_Score",

        "Finance_Score",

        "Green_Score",

        "Hospitality_Score",

        "Transit_Score",

        "Shopping_Score",

        "Business_Score",

        "Population_Pressure",

        "Growth_Pressure",

        "Amenity_Level",

        "Service_Gap",

        "Demand_Pressure",

        "Planning_Priority_Score",

        "Planning_Rank"

    ];


    Object.keys(row).forEach(
        key => {

            const value =
                row[key];


            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {

                cleaned[key] = "";

                return;

            }


            if (
                numericColumns.includes(key)
            ) {

                cleaned[key] =
                    Number(
                        String(value)
                            .replace(/,/g, "")
                    );

            }

            else {

                cleaned[key] =
                    String(value).trim();

            }

        }
    );


    return cleaned;

}


/* =========================================================
   INITIALISE DASHBOARD
   ========================================================= */

function initialiseDashboard() {

    createMetrics();

    createCharts();

    setupExplore();

    setupCompare();

    setupPriorityMap();

    setupDeepAnalysis();

    setupInsights();

    setupTable();

    setupFilter();

}


/* =========================================================
   FORMATTING HELPERS
   ========================================================= */

function formatNumber(value) {

    return Number(value).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2
        }
    );

}


function formatPercent(value) {

    return `${Number(value).toFixed(2)}%`;

}


function formatScore(value) {

    return Number(value).toFixed(3);

}


/* =========================================================
   CONSISTENT PRIORITY CLASSIFICATION
   =========================================================

   Priority is based ONLY on Planning Rank.

   Rank 1–5   = High Priority
   Rank 6–12  = Moderate Priority
   Rank 13–24 = Lower Priority

   Planning_Typology is kept separately as
   the Planning Profile.
   ========================================================= */
function getPriorityInfo(row) {

    const rank =
        Number(row.Planning_Rank) || 24;

    if (rank <= 5) {

        return {
            label: "High Priority",
            className: "high",
            color: "#c95843"
        };

    }

    if (rank <= 12) {

        return {
            label: "Moderate Priority",
            className: "medium",
            color: "#d09c42"
        };

    }

    return {
        label: "Lower Priority",
        className: "low",
        color: "#789074"
    };
}


/* =========================================================
   METRICS
   ========================================================= */

function createMetrics() {

    const container =
        document.getElementById(
            "metricGrid"
        );


    if (!container) {

        return;

    }


    const averagePopulation =
        neighbourhoodData.reduce(
            (sum, row) =>
                sum +
                Number(row.Population || 0),
            0
        ) /
        neighbourhoodData.length;


    const averageGrowth =
        neighbourhoodData.reduce(
            (sum, row) =>
                sum +
                Number(
                    row.Predicted_Growth_2025_Pct || 0
                ),
            0
        ) /
        neighbourhoodData.length;


    const averageServiceGap =
        neighbourhoodData.reduce(
            (sum, row) =>
                sum +
                Number(row.Service_Gap || 0),
            0
        ) /
        neighbourhoodData.length;


    const topPriority =
        [...neighbourhoodData]
            .sort(
                (a, b) =>
                    Number(a.Planning_Rank) -
                    Number(b.Planning_Rank)
            )[0];


    const highestPopulation =
        [...neighbourhoodData]
            .sort(
                (a, b) =>
                    Number(b.Population) -
                    Number(a.Population)
            )[0];


    container.innerHTML = `

        <div class="metric-card">

            <h3>Areas analysed</h3>

            <strong>
                ${neighbourhoodData.length}
            </strong>

            <p>
                Mumbai neighbourhoods
            </p>

        </div>


        <div class="metric-card">

            <h3>Average population</h3>

            <strong>
                ${formatNumber(
                    averagePopulation
                )}
            </strong>

            <p>
                Current population
            </p>

        </div>


        <div class="metric-card">

            <h3>Average growth</h3>

            <strong>
                ${formatPercent(
                    averageGrowth
                )}
            </strong>

            <p>
                Predicted growth
            </p>

        </div>


        <div class="metric-card">

            <h3>Average service gap</h3>

            <strong>
                ${formatPercent(
                    averageServiceGap * 100
                )}
            </strong>

            <p>
                City-wide average
            </p>

        </div>


        <div class="metric-card">

            <h3>Top priority</h3>

            <strong>
                ${topPriority.Neighborhood}
            </strong>

            <p>
                Planning Rank #1
            </p>

        </div>


        <div class="metric-card">

            <h3>Highest population</h3>

            <strong>
                ${highestPopulation.Neighborhood}
            </strong>

            <p>
                ${formatNumber(
                    highestPopulation.Population
                )}
            </p>

        </div>

    `;

}


/* =========================================================
   CHART MANAGEMENT
   ========================================================= */

function destroyChart(name) {

    if (charts[name]) {

        charts[name].destroy();

        charts[name] = null;

    }

}


/* =========================================================
   COMMON CHART OPTIONS
   ========================================================= */

function chartOptions() {

    return {

        responsive: true,

        maintainAspectRatio: false,

        animation: {

            duration: 500

        },

        layout: {

            padding: {

                top: 10,

                right: 15,

                bottom: 15,

                left: 10

            }

        },

        plugins: {

            legend: {

                labels: {

                    font: {

                        family: "Manrope",

                        size: 14

                    },

                    color: "#44413c",

                    boxWidth: 14,

                    padding: 15

                }

            },

            tooltip: {

                bodyFont: {

                    family: "Manrope",

                    size: 13

                },

                titleFont: {

                    family: "Manrope",

                    size: 14

                },

                padding: 12

            }

        },

        scales: {

            x: {

                ticks: {

                    color: "#5f5c56",

                    font: {

                        family: "Manrope",

                        size: 12

                    },

                    maxRotation: 45,

                    minRotation: 0

                },

                grid: {

                    color:
                        "rgba(90,85,75,0.10)"

                }

            },

            y: {

                ticks: {

                    color: "#5f5c56",

                    font: {

                        family: "DM Mono",

                        size: 12

                    }

                },

                grid: {

                    color:
                        "rgba(90,85,75,0.10)"

                }

            }

        }

    };

}


/* =========================================================
   CREATE ALL CHARTS
   ========================================================= */

function createCharts() {

    createPriorityChart();

    createGrowthChart();

    createPressureChart();

    createTypologyChart();

    createPopulationChart();

    createDemandChart();

}


/* =========================================================
   PRIORITY CHART
   ========================================================= */

function createPriorityChart(
    data = neighbourhoodData
) {

    const sorted =
        [...data]
            .sort(
                (a, b) =>
                    Number(a.Planning_Rank) -
                    Number(b.Planning_Rank)
            )
            .slice(0, 10);


    destroyChart("priority");


    const canvas =
        document.getElementById(
            "priorityChart"
        );


    if (!canvas) {

        return;

    }


    charts.priority =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        sorted.map(
                            row =>
                                row.Neighborhood
                        ),

                    datasets: [

                        {

                            label:
                                "Planning Priority Score",

                            data:
                                sorted.map(
                                    row =>
                                        Number(
                                            row.Planning_Priority_Score
                                        )
                                ),

                            backgroundColor:
                                sorted.map(
                                    row =>
                                        getPriorityInfo(
                                            row
                                        ).color
                                ),

                            borderRadius: 5,

                            barThickness: 22

                        }

                    ]

                },

                options: {

                    ...chartOptions(),

                    indexAxis: "y",

                    plugins: {

                        ...chartOptions()
                            .plugins,

                        legend: {

                            display: false

                        }

                    },

                    scales: {

                        x: {

                            beginAtZero: true,

                            max: 0.55,

                            ticks: {

                                font: {

                                    size: 13

                                }

                            }

                        },

                        y: {

                            ticks: {

                                font: {

                                    family:
                                        "Manrope",

                                    size: 13,

                                    weight: "600"

                                }

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   GROWTH CHART
   ========================================================= */

function createGrowthChart(
    data = neighbourhoodData
) {

    const sorted =
        [...data]
            .sort(
                (a, b) =>
                    Number(
                        b.Predicted_Growth_2025_Pct
                    ) -
                    Number(
                        a.Predicted_Growth_2025_Pct
                    )
            )
            .slice(0, 10);


    destroyChart("growth");


    const canvas =
        document.getElementById(
            "growthChart"
        );


    if (!canvas) {

        return;

    }


    charts.growth =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        sorted.map(
                            row =>
                                row.Neighborhood
                        ),

                    datasets: [

                        {

                            label:
                                "Predicted Growth (%)",

                            data:
                                sorted.map(
                                    row =>
                                        Number(
                                            row.Predicted_Growth_2025_Pct
                                        )
                                ),

                            backgroundColor:
                                "#789074",

                            borderRadius: 5,

                            barThickness: 20

                        }

                    ]

                },

                options: {

                    ...chartOptions(),

                    plugins: {

                        ...chartOptions()
                            .plugins,

                        legend: {

                            display: false

                        }

                    },

                    scales: {

                        x: {

                            ticks: {

                                font: {

                                    size: 11

                                },

                                maxRotation: 45,

                                minRotation: 30

                            }

                        },

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    value =>
                                        `${value}%`

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   POPULATION × SERVICE GAP
   =========================================================

   X = Population Pressure
   Y = Service Gap

   Both values are between 0 and 1.
   ========================================================= */

function createPressureChart(
    data = neighbourhoodData
) {

    destroyChart("pressure");


    const canvas =
        document.getElementById(
            "pressureChart"
        );


    if (!canvas) {

        return;

    }


   const points =
    data.map(
        row => {

            const populationPressure =
                Math.max(
                    0,
                    Math.min(
                        1,
                        Number(
                            row.Population_Pressure
                        ) || 0
                    )
                );

            const serviceGap =
                Math.max(
                    0,
                    Math.min(
                        1,
                        Number(
                            row.Service_Gap
                        ) || 0
                    )
                );

            return {

                // Position safely inside the graph
                x:
                    0.05 +
                    (populationPressure * 0.90),

                y:
                    0.05 +
                    (serviceGap * 0.90),

                // Keep original values for tooltip
                populationPressure:
                    populationPressure,

                serviceGap:
                    serviceGap,

                neighbourhood:
                    row.Neighborhood,

                rank:
                    Number(
                        row.Planning_Rank
                    )

            };

        }
    );


    charts.pressure =
        new Chart(
            canvas,
            {

                type: "scatter",

                data: {

                    datasets: [

                        {

                            label:
                                "Neighbourhoods",

                            data: points,

                            backgroundColor:
                                "#bd5a3b",

                            borderColor:
                                "#bd5a3b",

                            pointRadius: 6,

                            pointHoverRadius: 9,

                            pointBorderWidth: 2,

                            pointBorderColor:
                                "#f7f3eb"

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    layout: {

                        padding: {

                            top: 10,

                            right: 20,

                            bottom: 10,

                            left: 10

                        }

                    },

                    plugins: {

                        legend: {

                            display: false

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        const point =
                                            context.raw;

                                        return [

                                            point.neighbourhood,

                                            `Population Pressure: ${point.populationPressure.toFixed(2)}`,

                                            `Service Gap: ${point.serviceGap.toFixed(2)}`,
                                            `Planning Rank: #${point.rank}`

                                        ];

                                    }

                            }

                        }

                    },

                    scales: {

                        x: {

                            min: 0,

                            max: 1,

                           
                            title: {

                                display: true,

                                text:
                                    "Population Pressure",

                                color:
                                    "#4d4a45",

                                font: {

                                    family:
                                        "Manrope",

                                    size: 14,

                                    weight: "600"

                                }

                            },

                            ticks: {

                                stepSize: 0.1,

                                color:
                                    "#5f5c56",

                                font: {

                                    size: 12

                                }

                            },

                            grid: {

                                color:
                                    "rgba(90,85,75,0.14)"

                            }

                        },

                        y: {

                            min: 0,

                            max: 1,
                           
                            title: {

                                display: true,

                                text:
                                    "Service Gap",

                                color:
                                    "#4d4a45",

                                font: {

                                    family:
                                        "Manrope",

                                    size: 14,

                                    weight: "600"

                                }

                            },

                            ticks: {

                                stepSize: 0.1,

                                color:
                                    "#5f5c56",

                                font: {

                                    size: 12

                                }

                            },

                            grid: {

                                color:
                                    "rgba(90,85,75,0.14)"

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   TYPOLOGY CHART
   ========================================================= */

function createTypologyChart() {

    const canvas =
        document.getElementById(
            "typologyChart"
        );


    if (!canvas) {

        return;

    }


    const counts = {};


    neighbourhoodData.forEach(
        row => {

            const type =
                row.Planning_Typology ||
                "Other";


            counts[type] =
                (counts[type] || 0) + 1;

        }
    );


    destroyChart("typology");


    charts.typology =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels:
                        Object.keys(counts),

                    datasets: [

                        {

                            data:
                                Object.values(
                                    counts
                                ),

                            backgroundColor: [

                                "#bd5a3b",

                                "#789074",

                                "#d09c42",

                                "#7f8c8d",

                                "#9a8065"

                            ],

                            borderWidth: 3,

                            borderColor:
                                "#eee9df"

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "58%",

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                font: {

                                    family:
                                        "Manrope",

                                    size: 13

                                },

                                padding: 14

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   POPULATION CHART
   ========================================================= */

function createPopulationChart(
    data = neighbourhoodData
) {

    const sorted =
        [...data]
            .sort(
                (a, b) =>
                    Number(b.Population) -
                    Number(a.Population)
            )
            .slice(0, 10);


    destroyChart("population");


    const canvas =
        document.getElementById(
            "populationChart"
        );


    if (!canvas) {

        return;

    }


    charts.population =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        sorted.map(
                            row =>
                                row.Neighborhood
                        ),

                    datasets: [

                        {

                            label:
                                "Current Population",

                            data:
                                sorted.map(
                                    row =>
                                        Number(
                                            row.Population
                                        )
                                ),

                            backgroundColor:
                                "#789074",

                            borderRadius: 4

                        },

                        {

                            label:
                                "Predicted Population",

                            data:
                                sorted.map(
                                    row =>
                                        Number(
                                            row.Predicted_Population_2025
                                        )
                                ),

                            backgroundColor:
                                "#bd5a3b",

                            borderRadius: 4

                        }

                    ]

                },

                options: {

                    ...chartOptions(),

                    scales: {

                        x: {

                            ticks: {

                                maxRotation: 45,

                                minRotation: 30,

                                font: {

                                    size: 11

                                }

                            }

                        },

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    value =>
                                        Number(
                                            value
                                        ).toLocaleString(
                                            "en-IN"
                                        )

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   DEMAND CHART
   ========================================================= */

function createDemandChart(
    data = neighbourhoodData
) {

    const sorted =
        [...data]
            .sort(
                (a, b) =>
                    Number(
                        b.Demand_Pressure
                    ) -
                    Number(
                        a.Demand_Pressure
                    )
            )
            .slice(0, 10);


    destroyChart("demand");


    const canvas =
        document.getElementById(
            "demandChart"
        );


    if (!canvas) {

        return;

    }


    charts.demand =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        sorted.map(
                            row =>
                                row.Neighborhood
                        ),

                    datasets: [

                        {

                            label:
                                "Demand Pressure",

                            data:
                                sorted.map(
                                    row =>
                                        Number(
                                            row.Demand_Pressure
                                        )
                                ),

                            backgroundColor:
                                "#d09c42",

                            borderRadius: 4,

                            barThickness: 20

                        }

                    ]

                },

                options: {

                    ...chartOptions(),

                    plugins: {

                        ...chartOptions()
                            .plugins,

                        legend: {

                            display: false

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            max: 1,

                            ticks: {

                                stepSize: 0.1

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   EXPLORE SECTION
   ========================================================= */

function setupExplore() {

    const select =
        document.getElementById(
            "neighbourhoodSelect"
        );


    if (!select) {

        return;

    }


    select.innerHTML =
        `<option value="">Select a neighbourhood</option>`;


    neighbourhoodData.forEach(
        (row, index) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                index;


            option.textContent =
                row.Neighborhood;


            select.appendChild(
                option
            );

        }
    );


    select.addEventListener(
        "change",
        function () {

            const container =
                document.getElementById(
                    "profilePanel"
                );


            if (!container) {

                return;

            }


            if (this.value === "") {

                container.innerHTML = "";

                return;

            }


            displayProfile(
                neighbourhoodData[
                    Number(this.value)
                ]
            );

        }
    );

}



/* =========================================================
   DISPLAY NEIGHBOURHOOD PROFILE
   ========================================================= */

function displayProfile(row) {

    const container =
        document.getElementById(
            "profilePanel"
        );


    if (!container) {

        return;

    }


    const priority =
        getPriorityInfo(row);


    const planningRank =
        Number(
            row.Planning_Rank
        );


    const interpretation =
        getPlanningInterpretation(row);


    container.innerHTML = `

        <div class="profile-header">

            <div class="profile-title">

                <h3>
                    ${row.Neighborhood}
                </h3>

                <span
                    class="typology ${priority.className}">
                    ${priority.label}
                </span>

                <small
                    class="profile-rank-label">

                    Planning Rank #${planningRank}

                </small>

            </div>


            <div class="profile-rank">

                <small>
                    Planning Rank
                </small>

                <strong>
                    #${planningRank}
                </strong>

            </div>

        </div>


        <div class="profile-stats">


            <div class="profile-stat">

                <span>
                    Population
                </span>

                <strong>
                    ${formatNumber(
                        row.Population
                    )}
                </strong>

            </div>


            <div class="profile-stat">

                <span>
                    Predicted Population
                </span>

                <strong>
                    ${formatNumber(
                        row.Predicted_Population_2025
                    )}
                </strong>

            </div>


            <div class="profile-stat">

                <span>
                    Predicted Growth
                </span>

                <strong>
                    ${formatPercent(
                        row.Predicted_Growth_2025_Pct
                    )}
                </strong>

            </div>


            <div class="profile-stat">

                <span>
                    Service Gap
                </span>

                <strong>
                    ${formatPercent(
                        row.Service_Gap * 100
                    )}
                </strong>

            </div>


            <div class="profile-stat">

                <span>
                    Demand Pressure
                </span>

                <strong>
                    ${formatScore(
                        row.Demand_Pressure
                    )}
                </strong>

            </div>


        </div>


        <div class="profile-lower">


            <div class="profile-card">

                <h3>
                    Amenity profile
                </h3>

                <div class="amenity-profile">

                    ${createAmenityProfile(row)}

                </div>

            </div>


            <div class="profile-card interpretation">

                <div class="mini-kicker">
                    PLANNING INTERPRETATION
                </div>

                <h3>
                    ${interpretation.title}
                </h3>

                <p>
                    ${interpretation.text}
                </p>


                <div class="planning-profile">

                    <strong>
                        Planning profile:
                    </strong>

                        ${priority.label} · Rank #${planningRank}


                </div>

            </div>


        </div>

    `;

}


/* =========================================================
   AMENITY PROFILE
   =========================================================

   Each amenity is normalised against the
   maximum value of THAT SAME amenity
   across all neighbourhoods.

   Example:

   Healthcare of selected area
   --------------------------- × 100
   Highest healthcare value in dataset
   ========================================================= */
function createAmenityProfile(row) {

    // Get all amenity values for the selected neighbourhood
    const values = amenityColumns.map(
        amenity => Number(row[amenity.key]) || 0
    );

    // Find the highest amenity value for this neighbourhood
    const maximum = Math.max(...values);

    return amenityColumns.map(amenity => {

        const value = Number(row[amenity.key]) || 0;

        // Scale the largest value to 100%
        let percentage = 0;

        if (maximum > 0) {
            percentage = (value / maximum) * 100;
        }

        return `
            <div class="amenity-row">
                <div class="amenity-label">
                    <span>${amenity.label}</span>
                    <strong>${value.toFixed(2)}</strong>
                </div>

                <div class="amenity-track">
                    <div
                        class="amenity-fill"
                        style="width: ${percentage.toFixed(1)}%;"
                    ></div>
                </div>
            </div>
        `;
    }).join("");
}

/* =========================================================
   SIMPLE PLANNING INTERPRETATION
   ========================================================= */

function getPlanningInterpretation(row) {

    const rank =
        Number(
            row.Planning_Rank
        );


    const serviceGap =
        Number(
            row.Service_Gap
        );


    const growthPressure =
        Number(
            row.Growth_Pressure
        );


    const populationPressure =
        Number(
            row.Population_Pressure
        );


    const amenity =
        Number(
            row.Amenity_Level
        );


    /* -----------------------------------------------------
       TOP PRIORITY
       ----------------------------------------------------- */

    if (rank === 1) {

        return {

            title:
                "Highest planning priority",

            text:
                "This area is ranked #1. Its growth pressure and service gap create the strongest need for planning attention."

        };

    }


    /* -----------------------------------------------------
       HIGH SERVICE GAP
       ----------------------------------------------------- */

    if (serviceGap >= 0.5) {

        return {

            title:
                "Services need attention",

            text:
                "This area has a relatively high service gap. Improving services and infrastructure should be considered."

        };

    }


    /* -----------------------------------------------------
       HIGH POPULATION + GOOD SERVICES
       ----------------------------------------------------- */

    if (
        populationPressure >= 0.6 &&
        amenity >= 0.6
    ) {

        return {

            title:
                "High population, strong services",

            text:
                "The area has a large population and a strong existing service base. Future growth should be supported by enough capacity."

        };

    }


    /* -----------------------------------------------------
       GROWTH + GOOD AMENITIES
       ----------------------------------------------------- */

    if (
        growthPressure >= 0.6 &&
        amenity >= 0.6
    ) {

        return {

            title:
                "Growth with strong services",

            text:
                "The area shows higher growth pressure while already having good services. Future development should be managed carefully."

        };

    }


    /* -----------------------------------------------------
       DEFAULT
       ----------------------------------------------------- */

    return {

        title:
            "Maintain and monitor",

        text:
            "The area does not show a major imbalance. Existing services should be maintained while future changes are monitored."

    };

}


/* =========================================================
   COMPARE SECTION
   ========================================================= */

function setupCompare() {

    const selectA =
        document.getElementById(
            "compareA"
        );


    const selectB =
        document.getElementById(
            "compareB"
        );


    if (!selectA || !selectB) {

        return;

    }


    selectA.innerHTML = "";

    selectB.innerHTML = "";


    neighbourhoodData.forEach(
        (row, index) => {

            const optionA =
                document.createElement(
                    "option"
                );


            optionA.value =
                index;


            optionA.textContent =
                row.Neighborhood;


            const optionB =
                document.createElement(
                    "option"
                );


            optionB.value =
                index;


            optionB.textContent =
                row.Neighborhood;


            selectA.appendChild(
                optionA
            );


            selectB.appendChild(
                optionB
            );

        }
    );


    if (
        neighbourhoodData.length > 1
    ) {

        selectA.value = 0;

        selectB.value = 1;

    }


    function updateComparison() {

        const rowA =
            neighbourhoodData[
                Number(
                    selectA.value
                )
            ];


        const rowB =
            neighbourhoodData[
                Number(
                    selectB.value
                )
            ];


        if (
            rowA &&
            rowB
        ) {

            displayComparison(
                rowA,
                rowB
            );

        }

    }


    selectA.addEventListener(
        "change",
        updateComparison
    );


    selectB.addEventListener(
        "change",
        updateComparison
    );


    updateComparison();

}


/* =========================================================
   DISPLAY COMPARISON
   ========================================================= */

function displayComparison(a, b) {

    const container =
        document.getElementById(
            "comparisonPanel"
        );


    if (!container) {

        return;

    }


    const indicators = [

        {

            name: "Population",

            a:
                formatNumber(
                    a.Population
                ),

            b:
                formatNumber(
                    b.Population
                )

        },

        {

            name: "Predicted Growth",

            a:
                formatPercent(
                    a.Predicted_Growth_2025_Pct
                ),

            b:
                formatPercent(
                    b.Predicted_Growth_2025_Pct
                )

        },

        {

            name: "Population Pressure",

            a:
                formatScore(
                    a.Population_Pressure
                ),

            b:
                formatScore(
                    b.Population_Pressure
                )

        },

        {

            name: "Growth Pressure",

            a:
                formatScore(
                    a.Growth_Pressure
                ),

            b:
                formatScore(
                    b.Growth_Pressure
                )

        },

        {

            name: "Service Gap",

            a:
                formatPercent(
                    a.Service_Gap * 100
                ),

            b:
                formatPercent(
                    b.Service_Gap * 100
                )

        },

        {

            name: "Demand Pressure",

            a:
                formatScore(
                    a.Demand_Pressure
                ),

            b:
                formatScore(
                    b.Demand_Pressure
                )

        },

        {

            name: "Planning Priority Score",

            a:
                formatScore(
                    a.Planning_Priority_Score
                ),

            b:
                formatScore(
                    b.Planning_Priority_Score
                )

        },

        {

            name: "Planning Rank",

            a:
                `#${a.Planning_Rank}`,

            b:
                `#${b.Planning_Rank}`

        }

    ];


    const priorityA =
        getPriorityInfo(a);


    const priorityB =
        getPriorityInfo(b);


    function renderIndicators(
        side
    ) {

        return indicators
            .map(
                item => `

                    <div
                        class="compare-indicator">

                        <span>
                            ${item.name}
                        </span>

                        <strong>
                            ${
                                side === "a"
                                    ? item.a
                                    : item.b
                            }
                        </strong>

                    </div>

                `
            )
            .join("");

    }


    container.innerHTML = `

        <div class="comparison-grid">


            <div class="comparison-card">

                <h3>
                    ${a.Neighborhood}
                </h3>


                <div
                    class="compare-type"
                    style="
                        color:${priorityA.color};
                        font-weight:600;
                    ">

                    ${priorityA.label}

                </div>


                <div
                    class="comparison-rank">

                    Planning Rank #${a.Planning_Rank}

                </div>


                <div class="compare-indicators">

                    ${renderIndicators(
                        "a"
                    )}

                </div>

            </div>


            <div class="comparison-card">

                <h3>
                    ${b.Neighborhood}
                </h3>


                <div
                    class="compare-type"
                    style="
                        color:${priorityB.color};
                        font-weight:600;
                    ">

                    ${priorityB.label}

                </div>


                <div
                    class="comparison-rank">

                    Planning Rank #${b.Planning_Rank}

                </div>


                <div class="compare-indicators">

                    ${renderIndicators(
                        "b"
                    )}

                </div>

            </div>


        </div>


        <div class="compare-summary">

            ${createComparisonSummary(
                a,
                b
            )}

        </div>

    `;

}


/* =========================================================
   COMPARISON SUMMARY
   ========================================================= */

function createComparisonSummary(a, b) {

    const priorityArea =
        Number(a.Planning_Rank) <
        Number(b.Planning_Rank)
            ? a.Neighborhood
            : b.Neighborhood;


    const higherPopulation =
        Number(a.Population) >
        Number(b.Population)
            ? a.Neighborhood
            : b.Neighborhood;


    const higherGap =
        Number(a.Service_Gap) >
        Number(b.Service_Gap)
            ? a.Neighborhood
            : b.Neighborhood;


    return `

        <strong>
            ${priorityArea}
        </strong>
        has the higher planning priority.

        ${higherPopulation}
        has the larger population.

        ${higherGap}
        has the larger service gap.

    `;

}


/* =========================================================
   PRIORITY MAP
   ========================================================= */

function setupPriorityMap() {

    const mapElement =
        document.getElementById(
            "planningMap"
        );


    if (
        !mapElement ||
        typeof L === "undefined"
    ) {

        return;

    }


    if (planningMap) {

        planningMap.remove();

    }


    planningMap =
        L.map(
            mapElement,
            {

                zoomControl: true,

                scrollWheelZoom: true

            }
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            attribution:
                "&copy; OpenStreetMap contributors",

            maxZoom: 18

        }
    ).addTo(
        planningMap
    );


    const mumbaiCenter =
        [
            19.0760,
            72.8777
        ];


    planningMap.setView(
        mumbaiCenter,
        11
    );


    /*
       Indicative positions because
       planning.csv does not contain
       latitude / longitude.
    */

    const positions = {

        "Borivali":
            [19.2307, 72.8567],

        "Kandivali":
            [19.2040, 72.8400],

        "Malad":
            [19.1860, 72.8480],

        "Goregaon":
            [19.1663, 72.8526],

        "Jogeshwari":
            [19.1360, 72.8480],

        "Andheri West":
            [19.1360, 72.8270],

        "Andheri East":
            [19.1197, 72.8468],

        "Powai":
            [19.1176, 72.9060],

        "Vikhroli":
            [19.1110, 72.9280],

        "Mulund":
            [19.1726, 72.9425],

        "Ghatkopar":
            [19.0860, 72.9080],

        "Santacruz":
            [19.0843, 72.8356],

        "BKC":
            [19.0660, 72.8680],

        "Bandra East":
            [19.0600, 72.8460],

        "Bandra West":
            [19.0600, 72.8360],

        "Kurla":
            [19.0726, 72.8790],

        "Chembur":
            [19.0620, 72.8970],

        "Dadar":
            [19.0178, 72.8478],

        "Mahim":
            [19.0400, 72.8400],

        "Lower Parel":
            [18.9988, 72.8258],

        "Worli":
            [18.9980, 72.8170],

        "Girgaon":
            [18.9540, 72.8150],

        "Marine Lines":
            [18.9430, 72.8230],

        "Colaba":
            [18.9067, 72.8147]

    };


    const bounds = [];


    neighbourhoodData.forEach(
        row => {

            const position =
                positions[
                    row.Neighborhood
                ];


            if (!position) {

                return;

            }


            bounds.push(position);


            const priority =
                getPriorityInfo(row);


            const score =
                Number(
                    row.Planning_Priority_Score
                ) || 0;


            /*
               Marker size represents
               planning priority score.

               Marker colour represents
               rank-based priority.
            */

            const radius =
                7 +
                Math.min(
                    7,
                    score * 12
                );


            const marker =
                L.circleMarker(
                    position,
                    {

                        radius:
                            radius,

                        color:
                            "#ffffff",

                        weight: 3,

                        fillColor:
                            priority.color,

                        fillOpacity:
                            0.95

                    }
                ).addTo(
                    planningMap
                );


            marker.bindPopup(`

                <div
                    style="
                        font-family:Manrope,sans-serif;
                        min-width:190px;
                        line-height:1.6;
                    ">

                    <strong
                        style="
                            font-size:17px;
                        ">

                        ${row.Neighborhood}

                    </strong>

                    <br>

                    <span
                        style="
                            color:${priority.color};
                            font-weight:700;
                        ">

                        ${priority.label}

                    </span>

                    <br>

                    Planning Rank:
                    #${row.Planning_Rank}

                    <br>

                    Priority Score:
                    ${formatScore(
                        row.Planning_Priority_Score
                    )}

                    <br>

                    Service Gap:
                    ${formatPercent(
                        row.Service_Gap * 100
                    )}

                </div>

            `);

        }
    );


    if (bounds.length) {

        planningMap.fitBounds(
            bounds,
            {

                padding:
                    [
                        45,
                        45
                    ]

            }
        );

    }


    setTimeout(
        () => {

            if (planningMap) {

                planningMap.invalidateSize();

            }

        },
        300
    );


    createMapRanking();

}


/* =========================================================
   MAP RANKING
   ========================================================= */

function createMapRanking() {

    const container =
        document.getElementById(
            "mapRanking"
        );


    if (!container) {

        return;

    }


    const topFive =
        [...neighbourhoodData]
            .sort(
                (a, b) =>
                    Number(a.Planning_Rank) -
                    Number(b.Planning_Rank)
            )
            .slice(0, 5);


    container.innerHTML = `

        <div class="map-ranking-list">

            ${topFive
                .map(
                    row => {

                        const priority =
                            getPriorityInfo(
                                row
                            );


                        return `

                            <div
                                class="map-ranking-item">

                                <strong>

                                    #${row.Planning_Rank}
                                    ${row.Neighborhood}

                                </strong>

                                <span
                                    style="
                                        color:${priority.color};
                                    ">

                                    ${formatScore(
                                        row.Planning_Priority_Score
                                    )}

                                </span>

                            </div>

                        `;

                    }
                )
                .join("")
            }

        </div>

    `;

}


/* =========================================================
   DEEP ANALYSIS
   ========================================================= */

function setupDeepAnalysis() {

    createAmenityAverages();

    createServiceLeaders();

    createGrowthLeaders();

    createPressureMatrix();

}


/* =========================================================
   CITY AMENITY AVERAGES
   ========================================================= */

function createAmenityAverages() {

    const container =
        document.getElementById(
            "amenityAverages"
        );


    if (!container) {

        return;

    }


    const averages =
        amenityColumns.map(
            amenity => {

                const average =
                    neighbourhoodData.reduce(
                        (
                            sum,
                            row
                        ) =>
                            sum +
                            (
                                Number(
                                    row[
                                        amenity.key
                                    ]
                                ) || 0
                            ),

                        0

                    ) /
                    neighbourhoodData.length;


                return {

                    label:
                        amenity.label,

                    value:
                        average

                };

            }
        );


    /*
       Average facility scores use
       one common 0–100 scale.

       Therefore:
       91.83 = 91.83% width
       47.63 = 47.63% width
       38.71 = 38.71% width
       8.33  = 8.33% width
    */

    const maximum = 100;


    container.innerHTML =
        averages
            .map(
                item => {

                    let width =
                        (
                            item.value /
                            maximum
                        ) * 100;


                    width =
                        Math.max(
                            0,
                            Math.min(
                                100,
                                width
                            )
                        );


                    return `

                        <div
                            class="average-amenity">

                            <div
                                class="average-amenity-top">

                                <span>
                                    ${item.label}
                                </span>

                                <span>
                                    ${item.value.toFixed(2)}
                                </span>

                            </div>


                            <div
                                class="average-track">

                                <div
                                    class="average-fill"
                                    style="
                                        width:${width.toFixed(1)}%;
                                        max-width:100%;
                                    ">
                                </div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}
/* =========================================================
   SERVICE GAP LEADERS
   ========================================================= */

function createServiceLeaders() {

    const container =
        document.getElementById(
            "serviceLeaders"
        );


    if (!container) {

        return;

    }


    const data =
        [...neighbourhoodData]
            .sort(
                (a, b) =>
                    Number(b.Service_Gap) -
                    Number(a.Service_Gap)
            )
            .slice(0, 5);


    container.innerHTML =
        data
            .map(
                row => `

                    <div
                        class="leader-item">

                        <strong>
                            ${row.Neighborhood}
                        </strong>

                        <span>
                            ${formatPercent(
                                row.Service_Gap * 100
                            )}
                        </span>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   GROWTH LEADERS
   ========================================================= */

function createGrowthLeaders() {

    const container =
        document.getElementById(
            "growthLeaders"
        );


    if (!container) {

        return;

    }


    const data =
        [...neighbourhoodData]
            .sort(
                (a, b) =>
                    Number(
                        b.Predicted_Growth_2025_Pct
                    ) -
                    Number(
                        a.Predicted_Growth_2025_Pct
                    )
            )
            .slice(0, 5);


    container.innerHTML =
        data
            .map(
                row => `

                    <div
                        class="leader-item">

                        <strong>
                            ${row.Neighborhood}
                        </strong>

                        <span>
                            ${formatPercent(
                                row.Predicted_Growth_2025_Pct
                            )}
                        </span>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   PRESSURE MATRIX
   =========================================================

   X = Population Pressure
   Y = Service Gap

   Points are intentionally placed
   between 10% and 90% so that they
   remain safely inside the matrix.
   ========================================================= */

function createPressureMatrix() {

    const container =
        document.getElementById(
            "matrixDots"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    neighbourhoodData.forEach(
        row => {

            const dot =
                document.createElement(
                    "div"
                );


            dot.className =
                "matrix-dot";


            const populationPressure =
                Math.max(
                    0,
                    Math.min(
                        1,
                        Number(
                            row.Population_Pressure
                        ) || 0
                    )
                );


            const serviceGap =
                Math.max(
                    0,
                    Math.min(
                        1,
                        Number(
                            row.Service_Gap
                        ) || 0
                    )
                );


            const priority =
                getPriorityInfo(
                    row
                );


            dot.classList.add(
                priority.className
            );


            /*
               10% to 90% safe plotting area.
            */

            const left =
                10 +
                (
                    populationPressure *
                    80
                );


            const bottom =
                10 +
                (
                    serviceGap *
                    80
                );


            dot.style.left =
                `${left}%`;


            dot.style.bottom =
                `${bottom}%`;


            dot.style.position =
                "absolute";


            dot.style.transform =
                "translate(-50%, 50%)";


            dot.title =
                `${row.Neighborhood} — ${priority.label}`;


            dot.setAttribute(
                "data-neighbourhood",
                row.Neighborhood
            );


            container.appendChild(
                dot
            );

        }
    );

}


/* =========================================================
   DATA TABLE
   =========================================================

   TABLE STRUCTURE IS KEPT UNCHANGED.
   ========================================================= */

function setupTable() {

    renderTable(
        neighbourhoodData
    );


    const search =
        document.getElementById(
            "tableSearch"
        );


    if (!search) {

        return;

    }


    search.addEventListener(
        "input",
        function () {

            const query =
                this.value
                    .toLowerCase()
                    .trim();


            const filtered =
                neighbourhoodData.filter(
                    row =>
                        row.Neighborhood
                            .toLowerCase()
                            .includes(query)
                );


            renderTable(
                filtered
            );

        }
    );

}


/* =========================================================
   RENDER DATA TABLE
   ========================================================= */

function renderTable(data) {

    const tbody =
        document.getElementById(
            "dataTable"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML =
        [...data]
            .sort(
                (a, b) =>
                    Number(a.Planning_Rank) -
                    Number(b.Planning_Rank)
            )
            .map(
                row => `

                    <tr>

                        <td>
                            <strong>
                                ${row.Neighborhood}
                            </strong>
                        </td>

                        <td>
                            ${formatNumber(
                                row.Population
                            )}
                        </td>

                        <td>
                            ${formatPercent(
                                row.Predicted_Growth_2025_Pct
                            )}
                        </td>

                        <td>
                            ${formatPercent(
                                row.Service_Gap * 100
                            )}
                        </td>

                        <td>
                            ${formatScore(
                                row.Demand_Pressure
                            )}
                        </td>

                        <td>
                            ${formatScore(
                                row.Planning_Priority_Score
                            )}
                        </td>

                        <td>
                            #${row.Planning_Rank}
                        </td>

                    </tr>

                `
            )
            .join("");

}


/* =========================================================
   OVERVIEW FILTER
   ========================================================= */

function setupFilter() {

    const filter =
        document.getElementById(
            "priorityFilter"
        );


    if (!filter) {

        return;

    }


    filter.addEventListener(
        "change",
        function () {

            const value =
                this.value;


            let data =
                neighbourhoodData;


            if (
                value === "top10"
            ) {

                data =
                    [...neighbourhoodData]
                        .sort(
                            (a, b) =>
                                Number(
                                    a.Planning_Rank
                                ) -
                                Number(
                                    b.Planning_Rank
                                )
                        )
                        .slice(
                            0,
                            10
                        );

            }


            if (
                value === "service"
            ) {

                data =
                    [...neighbourhoodData]
                        .sort(
                            (a, b) =>
                                Number(
                                    b.Service_Gap
                                ) -
                                Number(
                                    a.Service_Gap
                                )
                        )
                        .slice(
                            0,
                            10
                        );

            }


            if (
                value === "growth"
            ) {

                data =
                    [...neighbourhoodData]
                        .sort(
                            (a, b) =>
                                Number(
                                    b.Predicted_Growth_2025_Pct
                                ) -
                                Number(
                                    a.Predicted_Growth_2025_Pct
                                )
                        )
                        .slice(
                            0,
                            10
                        );

            }


            createPriorityChart(
                data
            );


            createGrowthChart(
                data
            );


            createPressureChart(
                data
            );


            createPopulationChart(
                data
            );


            createDemandChart(
                data
            );

        }
    );

}


/* =========================================================
   INSIGHTS
   ========================================================= */

function setupInsights() {

    const container =
        document.getElementById(
            "insightGrid"
        );


    if (!container) {

        return;

    }


    const topPriority =
        [...neighbourhoodData]
            .sort(
                (a, b) =>
                    Number(a.Planning_Rank) -
                    Number(b.Planning_Rank)
            )[0];


    const highestPopulation =
        [...neighbourhoodData]
            .sort(
                (a, b) =>
                    Number(b.Population) -
                    Number(a.Population)
            )[0];


    const largestGap =
        [...neighbourhoodData]
            .sort(
                (a, b) =>
                    Number(b.Service_Gap) -
                    Number(a.Service_Gap)
            )[0];


    const fastestGrowth =
        [...neighbourhoodData]
            .sort(
                (a, b) =>
                    Number(
                        b.Predicted_Growth_2025_Pct
                    ) -
                    Number(
                        a.Predicted_Growth_2025_Pct
                    )
            )[0];


    const strongestAmenity =
        [...neighbourhoodData]
            .sort(
                (a, b) =>
                    Number(b.Amenity_Level) -
                    Number(a.Amenity_Level)
            )[0];


    const lowestPriority =
        [...neighbourhoodData]
            .sort(
                (a, b) =>
                    Number(b.Planning_Rank) -
                    Number(a.Planning_Rank)
            )[0];


    const insights = [

        {

            title:
                `${topPriority.Neighborhood} is ranked #1`,

            text:
                `${topPriority.Neighborhood} has the highest planning priority in the dataset. Its growth and service conditions create the strongest overall planning signal.`

        },


        {

            title:
                `${highestPopulation.Neighborhood} has the largest population`,

            text:
                `Its population is ${formatNumber(
                    highestPopulation.Population
                )}. A large population does not automatically mean the highest planning priority.`

        },


        {

            title:
                `${largestGap.Neighborhood} has the largest service gap`,

            text:
                `Its service gap is ${formatPercent(
                    largestGap.Service_Gap * 100
                )}. This shows where service conditions need closer attention.`

        },


        {

            title:
                `${fastestGrowth.Neighborhood} has the fastest growth`,

            text:
                `Its predicted growth is ${formatPercent(
                    fastestGrowth.Predicted_Growth_2025_Pct
                )}. Future demand should therefore be monitored.`

        },


        {

            title:
                `${strongestAmenity.Neighborhood} has the strongest amenity level`,

            text:
                `Its amenity level is ${formatScore(
                    strongestAmenity.Amenity_Level
                )}, showing a strong existing facility base.`

        },


        {

            title:
                `${lowestPriority.Neighborhood} has the lowest planning priority`,

            text:
                `Its indicators show relatively lower planning pressure compared with the other neighbourhoods.`

        }

    ];


    container.innerHTML =
        insights
            .map(
                (item, index) => `

                    <article
                        class="insight-card">

                        <div
                            class="insight-number">

                            ${String(
                                index + 1
                            ).padStart(
                                2,
                                "0"
                            )}

                        </div>


                        <h3>
                            ${item.title}
                        </h3>


                        <p>
                            ${item.text}
                        </p>

                    </article>

                `
            )
            .join("");

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav-item"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const target =
                        document.getElementById(
                            this.dataset.target
                        );


                    if (target) {

                        target.scrollIntoView(
                            {

                                behavior:
                                    "smooth"

                            }
                        );

                    }

                }
            );

        }
    );


    const sections =
        document.querySelectorAll(
            ".section-block[id]"
        );


    if (!sections.length) {

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            buttons.forEach(
                                button => {

                                    button.classList.toggle(

                                        "active",

                                        button.dataset.target ===
                                        entry.target.id

                                    );

                                }
                            );

                        }

                    }
                );

            },

            {

                rootMargin:
                    "-30% 0px -60% 0px"

            }

        );


    sections.forEach(
        section =>
            observer.observe(
                section
            )
    );

}


/* =========================================================
   SCROLL BUTTONS
   ========================================================= */

function setupScrollButtons() {

    document
        .querySelectorAll(
            "[data-scroll]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const target =
                            document.getElementById(
                                this.dataset.scroll
                            );


                        if (target) {

                            target.scrollIntoView(
                                {

                                    behavior:
                                        "smooth"

                                }
                            );

                        }

                    }
                );

            }
        );

}