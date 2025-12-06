// Cloudflare Pages Function - Protected Metrics endpoint
interface Env {
  AUTH_SECRET: string;
  ALLOWED_ORIGIN?: string; // Set in Cloudflare Pages dashboard
}

interface ClinicianMetrics {
  revenue: number;
  sessions: number;
  clients: number;
}

interface MonthlyMetrics {
  revenue: number;
  sessions: number;
  activeClients: number;
  newClients: number;
  churnedClients: number;
  clinicians: Record<string, ClinicianMetrics>;
}

// Embedded metrics data (processed from CSV - no raw client data)
const METRICS_DATA: Record<string, MonthlyMetrics> = {
  "2023-02": {
    "revenue": 17220.0,
    "sessions": 74,
    "activeClients": 20,
    "newClients": 20,
    "churnedClients": 0,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 17220.0,
        "sessions": 74,
        "clients": 20
      }
    }
  },
  "2023-03": {
    "revenue": 14560.0,
    "sessions": 62,
    "activeClients": 20,
    "newClients": 0,
    "churnedClients": 0,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 14560.0,
        "sessions": 62,
        "clients": 20
      }
    }
  },
  "2023-04": {
    "revenue": 17105.0,
    "sessions": 73,
    "activeClients": 21,
    "newClients": 3,
    "churnedClients": 2,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 17105.0,
        "sessions": 73,
        "clients": 21
      }
    }
  },
  "2023-05": {
    "revenue": 18925.0,
    "sessions": 81,
    "activeClients": 20,
    "newClients": 0,
    "churnedClients": 3,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 18925.0,
        "sessions": 81,
        "clients": 20
      }
    }
  },
  "2023-06": {
    "revenue": 17445.0,
    "sessions": 74,
    "activeClients": 25,
    "newClients": 4,
    "churnedClients": 0,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 15300.0,
        "sessions": 65,
        "clients": 21
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 2145.0,
        "sessions": 9,
        "clients": 4
      }
    }
  },
  "2023-07": {
    "revenue": 24005.0,
    "sessions": 104,
    "activeClients": 32,
    "newClients": 9,
    "churnedClients": 2,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 17360.0,
        "sessions": 73,
        "clients": 19
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 3780.0,
        "sessions": 16,
        "clients": 6
      },
      "Alaina Malik": {
        "revenue": 2865.0,
        "sessions": 15,
        "clients": 8
      }
    }
  },
  "2023-08": {
    "revenue": 36630.0,
    "sessions": 166,
    "activeClients": 44,
    "newClients": 13,
    "churnedClients": 3,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 15270.0,
        "sessions": 65,
        "clients": 19
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 6360.0,
        "sessions": 27,
        "clients": 6
      },
      "Alaina Malik": {
        "revenue": 12405.0,
        "sessions": 62,
        "clients": 15
      },
      "Aditi Rai": {
        "revenue": 2595.0,
        "sessions": 12,
        "clients": 7
      }
    }
  },
  "2023-09": {
    "revenue": 43075.0,
    "sessions": 196,
    "activeClients": 57,
    "newClients": 12,
    "churnedClients": 0,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 15645.0,
        "sessions": 64,
        "clients": 20
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 4345.0,
        "sessions": 21,
        "clients": 9
      },
      "Aditi Rai": {
        "revenue": 4980.0,
        "sessions": 26,
        "clients": 9
      },
      "Alaina Malik": {
        "revenue": 12690.0,
        "sessions": 62,
        "clients": 18
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 5415.0,
        "sessions": 23,
        "clients": 7
      }
    }
  },
  "2023-10": {
    "revenue": 57525.0,
    "sessions": 259,
    "activeClients": 62,
    "newClients": 10,
    "churnedClients": 5,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 15835.0,
        "sessions": 62,
        "clients": 18
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 6200.0,
        "sessions": 27,
        "clients": 7
      },
      "Alaina Malik": {
        "revenue": 17070.0,
        "sessions": 82,
        "clients": 19
      },
      "Aditi Rai": {
        "revenue": 11010.0,
        "sessions": 53,
        "clients": 18
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 7410.0,
        "sessions": 35,
        "clients": 10
      }
    }
  },
  "2023-11": {
    "revenue": 62915.0,
    "sessions": 285,
    "activeClients": 68,
    "newClients": 10,
    "churnedClients": 9,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 14150.0,
        "sessions": 55,
        "clients": 18
      },
      "Alaina Malik": {
        "revenue": 18730.0,
        "sessions": 89,
        "clients": 23
      },
      "Aditi Rai": {
        "revenue": 14145.0,
        "sessions": 68,
        "clients": 20
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 5295.0,
        "sessions": 23,
        "clients": 7
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 10595.0,
        "sessions": 50,
        "clients": 12
      }
    }
  },
  "2023-12": {
    "revenue": 51185.0,
    "sessions": 233,
    "activeClients": 72,
    "newClients": 7,
    "churnedClients": 7,
    "clinicians": {
      "Rudhdi Karnik, LMSW": {
        "revenue": 4675.0,
        "sessions": 20,
        "clients": 7
      },
      "Aditi Rai": {
        "revenue": 10230.0,
        "sessions": 49,
        "clients": 18
      },
      "Alaina Malik": {
        "revenue": 12105.0,
        "sessions": 58,
        "clients": 23
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 13435.0,
        "sessions": 63,
        "clients": 18
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 9240.0,
        "sessions": 36,
        "clients": 16
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 1500.0,
        "sessions": 7,
        "clients": 3
      }
    }
  },
  "2024-01": {
    "revenue": 74200.0,
    "sessions": 333,
    "activeClients": 84,
    "newClients": 15,
    "churnedClients": 7,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 12840.0,
        "sessions": 48,
        "clients": 14
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 5530.0,
        "sessions": 24,
        "clients": 7
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 20795.0,
        "sessions": 96,
        "clients": 24
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 4080.0,
        "sessions": 19,
        "clients": 9
      },
      "Alaina Malik": {
        "revenue": 15440.0,
        "sessions": 72,
        "clients": 22
      },
      "Aditi Rai": {
        "revenue": 15515.0,
        "sessions": 74,
        "clients": 21
      }
    }
  },
  "2024-02": {
    "revenue": 70765.0,
    "sessions": 322,
    "activeClients": 82,
    "newClients": 4,
    "churnedClients": 10,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 7155.0,
        "sessions": 27,
        "clients": 12
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 5610.0,
        "sessions": 25,
        "clients": 8
      },
      "Alaina Malik": {
        "revenue": 17965.0,
        "sessions": 83,
        "clients": 22
      },
      "Aditi Rai": {
        "revenue": 14700.0,
        "sessions": 70,
        "clients": 20
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 19140.0,
        "sessions": 88,
        "clients": 23
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 6195.0,
        "sessions": 29,
        "clients": 10
      }
    }
  },
  "2024-03": {
    "revenue": 73350.0,
    "sessions": 343,
    "activeClients": 82,
    "newClients": 6,
    "churnedClients": 12,
    "clinicians": {
      "Alaina Malik": {
        "revenue": 16080.0,
        "sessions": 75,
        "clients": 23
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 13560.0,
        "sessions": 66,
        "clients": 19
      },
      "Aditi Rai": {
        "revenue": 11375.0,
        "sessions": 55,
        "clients": 17
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 10320.0,
        "sessions": 48,
        "clients": 14
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 16935.0,
        "sessions": 77,
        "clients": 25
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 5080.0,
        "sessions": 22,
        "clients": 7
      }
    }
  },
  "2024-04": {
    "revenue": 79830.0,
    "sessions": 378,
    "activeClients": 83,
    "newClients": 2,
    "churnedClients": 7,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 12860.0,
        "sessions": 69,
        "clients": 19
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 5140.0,
        "sessions": 22,
        "clients": 8
      },
      "Alaina Malik": {
        "revenue": 13910.0,
        "sessions": 65,
        "clients": 23
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 20775.0,
        "sessions": 94,
        "clients": 24
      },
      "Aditi Rai": {
        "revenue": 12590.0,
        "sessions": 61,
        "clients": 19
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 14555.0,
        "sessions": 67,
        "clients": 19
      }
    }
  },
  "2024-05": {
    "revenue": 82310.0,
    "sessions": 376,
    "activeClients": 89,
    "newClients": 9,
    "churnedClients": 8,
    "clinicians": {
      "Rudhdi Karnik, LMSW": {
        "revenue": 4320.0,
        "sessions": 18,
        "clients": 7
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 5440.0,
        "sessions": 20,
        "clients": 11
      },
      "Alaina Malik": {
        "revenue": 19115.0,
        "sessions": 89,
        "clients": 22
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 18975.0,
        "sessions": 86,
        "clients": 25
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 17580.0,
        "sessions": 80,
        "clients": 19
      },
      "Aditi Rai": {
        "revenue": 7790.0,
        "sessions": 38,
        "clients": 16
      },
      "Shivon Ramadhin, LMSW": {
        "revenue": 6150.0,
        "sessions": 31,
        "clients": 9
      },
      "Tanisha Singh, LMSW": {
        "revenue": 2940.0,
        "sessions": 14,
        "clients": 5
      }
    }
  },
  "2024-06": {
    "revenue": 63154.0,
    "sessions": 286,
    "activeClients": 84,
    "newClients": 6,
    "churnedClients": 20,
    "clinicians": {
      "Gajan Gugendiran, LMHC": {
        "revenue": 14035.0,
        "sessions": 64,
        "clients": 21
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 4800.0,
        "sessions": 18,
        "clients": 8
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 3700.0,
        "sessions": 16,
        "clients": 7
      },
      "Alaina Malik": {
        "revenue": 3810.0,
        "sessions": 18,
        "clients": 18
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 18185.0,
        "sessions": 82,
        "clients": 25
      },
      "Shivon Ramadhin, LMSW": {
        "revenue": 7640.0,
        "sessions": 35,
        "clients": 12
      },
      "Tanisha Singh, LMSW": {
        "revenue": 8317.0,
        "sessions": 40,
        "clients": 14
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 2667.0,
        "sessions": 13,
        "clients": 8
      }
    }
  },
  "2024-07": {
    "revenue": 65327.0,
    "sessions": 298,
    "activeClients": 82,
    "newClients": 8,
    "churnedClients": 25,
    "clinicians": {
      "Tamanna Ahmad, LMSW": {
        "revenue": 18035.0,
        "sessions": 82,
        "clients": 23
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 8905.0,
        "sessions": 41,
        "clients": 20
      },
      "Shivon Ramadhin, LMSW": {
        "revenue": 11705.0,
        "sessions": 54,
        "clients": 17
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 8755.0,
        "sessions": 42,
        "clients": 16
      },
      "Tanisha Singh, LMSW": {
        "revenue": 4750.0,
        "sessions": 22,
        "clients": 13
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 4140.0,
        "sessions": 18,
        "clients": 6
      },
      "Deepa Saharia, LMSW": {
        "revenue": 3630.0,
        "sessions": 18,
        "clients": 8
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 5407.0,
        "sessions": 21,
        "clients": 8
      }
    }
  },
  "2024-08": {
    "revenue": 75045.0,
    "sessions": 343,
    "activeClients": 85,
    "newClients": 7,
    "churnedClients": 19,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 6250.0,
        "sessions": 24,
        "clients": 9
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 3890.0,
        "sessions": 17,
        "clients": 6
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 17497.5,
        "sessions": 80,
        "clients": 25
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 16960.0,
        "sessions": 77,
        "clients": 24
      },
      "Deepa Saharia, LMSW": {
        "revenue": 8142.5,
        "sessions": 41,
        "clients": 11
      },
      "Shivon Ramadhin, LMSW": {
        "revenue": 12395.0,
        "sessions": 57,
        "clients": 19
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 9710.0,
        "sessions": 46,
        "clients": 16
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 200.0,
        "sessions": 1,
        "clients": 1
      }
    }
  },
  "2024-09": {
    "revenue": 93640.0,
    "sessions": 430,
    "activeClients": 97,
    "newClients": 12,
    "churnedClients": 12,
    "clinicians": {
      "Rudhdi Karnik, LMSW": {
        "revenue": 3900.0,
        "sessions": 17,
        "clients": 7
      },
      "Deepa Saharia, LMSW": {
        "revenue": 8280.0,
        "sessions": 41,
        "clients": 12
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 19470.0,
        "sessions": 88,
        "clients": 28
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 19410.0,
        "sessions": 87,
        "clients": 31
      },
      "Shivon Ramadhin, LMSW": {
        "revenue": 17500.0,
        "sessions": 79,
        "clients": 22
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 14835.0,
        "sessions": 70,
        "clients": 18
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 6340.0,
        "sessions": 30,
        "clients": 17
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 3905.0,
        "sessions": 18,
        "clients": 9
      }
    }
  },
  "2024-10": {
    "revenue": 114830.0,
    "sessions": 545,
    "activeClients": 103,
    "newClients": 6,
    "churnedClients": 7,
    "clinicians": {
      "Tamanna Ahmad, LMSW": {
        "revenue": 22455.0,
        "sessions": 100,
        "clients": 28
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 10080.0,
        "sessions": 47,
        "clients": 11
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 9895.0,
        "sessions": 64,
        "clients": 16
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 4750.0,
        "sessions": 21,
        "clients": 6
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 19915.0,
        "sessions": 90,
        "clients": 26
      },
      "Shivon Ramadhin, LMSW": {
        "revenue": 16220.0,
        "sessions": 73,
        "clients": 23
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 20540.0,
        "sessions": 96,
        "clients": 23
      },
      "Deepa Saharia, LMSW": {
        "revenue": 10545.0,
        "sessions": 52,
        "clients": 12
      },
      "Apeksha Mehta, MHC-LP": {
        "revenue": 430.0,
        "sessions": 2,
        "clients": 2
      }
    }
  },
  "2024-11": {
    "revenue": 98401.0,
    "sessions": 459,
    "activeClients": 109,
    "newClients": 7,
    "churnedClients": 8,
    "clinicians": {
      "Rebecca Singh, MHC-LP": {
        "revenue": 12525.0,
        "sessions": 60,
        "clients": 18
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 17915.0,
        "sessions": 80,
        "clients": 27
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 17040.0,
        "sessions": 76,
        "clients": 28
      },
      "Deepa Saharia, LMSW": {
        "revenue": 9250.0,
        "sessions": 46,
        "clients": 12
      },
      "Apeksha Mehta, MHC-LP": {
        "revenue": 5685.0,
        "sessions": 27,
        "clients": 9
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 6956.0,
        "sessions": 37,
        "clients": 15
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 4295.0,
        "sessions": 19,
        "clients": 6
      },
      "Shivon Ramadhin, LMSW": {
        "revenue": 13825.0,
        "sessions": 63,
        "clients": 19
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 10910.0,
        "sessions": 51,
        "clients": 21
      }
    }
  },
  "2024-12": {
    "revenue": 96011.66,
    "sessions": 436,
    "activeClients": 104,
    "newClients": 1,
    "churnedClients": 10,
    "clinicians": {
      "Deepa Saharia, LMSW": {
        "revenue": 9130.0,
        "sessions": 45,
        "clients": 12
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 5680.0,
        "sessions": 22,
        "clients": 7
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 17920.0,
        "sessions": 80,
        "clients": 26
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 17550.0,
        "sessions": 80,
        "clients": 20
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 14155.0,
        "sessions": 63,
        "clients": 24
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 10505.0,
        "sessions": 50,
        "clients": 18
      },
      "Shivon Ramadhin, LMSW": {
        "revenue": 12520.0,
        "sessions": 57,
        "clients": 19
      },
      "Rudhdi Karnik, LMSW": {
        "revenue": 2950.0,
        "sessions": 13,
        "clients": 5
      },
      "Apeksha Mehta, MHC-LP": {
        "revenue": 5601.66,
        "sessions": 26,
        "clients": 11
      }
    }
  },
  "2025-01": {
    "revenue": 96286.0,
    "sessions": 449,
    "activeClients": 102,
    "newClients": 8,
    "churnedClients": 19,
    "clinicians": {
      "Tamanna Ahmad, LMSW": {
        "revenue": 11560.0,
        "sessions": 52,
        "clients": 22
      },
      "Shivon Ramadhin, LMSW": {
        "revenue": 12435.0,
        "sessions": 56,
        "clients": 19
      },
      "Deepa Saharia, LMSW": {
        "revenue": 8960.0,
        "sessions": 44,
        "clients": 12
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 18915.0,
        "sessions": 84,
        "clients": 25
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 14490.0,
        "sessions": 67,
        "clients": 20
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 12115.0,
        "sessions": 60,
        "clients": 18
      },
      "Apeksha Mehta, MHC-LP": {
        "revenue": 12360.0,
        "sessions": 67,
        "clients": 21
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 5451.0,
        "sessions": 19,
        "clients": 7
      }
    }
  },
  "2025-02": {
    "revenue": 106109.0,
    "sessions": 516,
    "activeClients": 113,
    "newClients": 12,
    "churnedClients": 16,
    "clinicians": {
      "Apeksha Mehta, MHC-LP": {
        "revenue": 13396.0,
        "sessions": 77,
        "clients": 24
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 17490.0,
        "sessions": 80,
        "clients": 27
      },
      "Deepa Saharia, LMSW": {
        "revenue": 8050.0,
        "sessions": 40,
        "clients": 12
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 4518.0,
        "sessions": 16,
        "clients": 6
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 15730.0,
        "sessions": 71,
        "clients": 23
      },
      "Shivon Ramadhin, LMSW": {
        "revenue": 13240.0,
        "sessions": 63,
        "clients": 19
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 17530.0,
        "sessions": 81,
        "clients": 22
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 12805.0,
        "sessions": 66,
        "clients": 18
      },
      "Riddhi Cidambi, LCSW": {
        "revenue": 3350.0,
        "sessions": 22,
        "clients": 9
      }
    }
  },
  "2025-03": {
    "revenue": 102765.0,
    "sessions": 494,
    "activeClients": 115,
    "newClients": 5,
    "churnedClients": 10,
    "clinicians": {
      "Rebecca Singh, MHC-LP": {
        "revenue": 12470.0,
        "sessions": 58,
        "clients": 17
      },
      "Deepa Saharia, LMSW": {
        "revenue": 8255.0,
        "sessions": 42,
        "clients": 12
      },
      "Apeksha Mehta, MHC-LP": {
        "revenue": 16380.0,
        "sessions": 86,
        "clients": 23
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 11650.0,
        "sessions": 54,
        "clients": 25
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 19840.0,
        "sessions": 94,
        "clients": 27
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 16900.0,
        "sessions": 79,
        "clients": 21
      },
      "Shivon Ramadhin, LMSW": {
        "revenue": 7160.0,
        "sessions": 32,
        "clients": 18
      },
      "Riddhi Cidambi, LCSW": {
        "revenue": 4725.0,
        "sessions": 29,
        "clients": 11
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 5385.0,
        "sessions": 20,
        "clients": 6
      }
    }
  },
  "2025-04": {
    "revenue": 111220.0,
    "sessions": 530,
    "activeClients": 109,
    "newClients": 8,
    "churnedClients": 21,
    "clinicians": {
      "Tamanna Ahmad, LMSW": {
        "revenue": 21495.0,
        "sessions": 98,
        "clients": 28
      },
      "Deepa Saharia, LMSW": {
        "revenue": 9430.0,
        "sessions": 48,
        "clients": 12
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 12810.0,
        "sessions": 58,
        "clients": 18
      },
      "Apeksha Mehta, MHC-LP": {
        "revenue": 19370.0,
        "sessions": 92,
        "clients": 25
      },
      "Riddhi Cidambi, LCSW": {
        "revenue": 9300.0,
        "sessions": 55,
        "clients": 18
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 19390.0,
        "sessions": 90,
        "clients": 26
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 4170.0,
        "sessions": 18,
        "clients": 7
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 15255.0,
        "sessions": 71,
        "clients": 18
      }
    }
  },
  "2025-05": {
    "revenue": 107319.0,
    "sessions": 512,
    "activeClients": 108,
    "newClients": 3,
    "churnedClients": 23,
    "clinicians": {
      "Deepa Saharia, LMSW": {
        "revenue": 8825.0,
        "sessions": 44,
        "clients": 12
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 15080.0,
        "sessions": 70,
        "clients": 19
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 15920.0,
        "sessions": 73,
        "clients": 17
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 18880.0,
        "sessions": 89,
        "clients": 26
      },
      "Riddhi Cidambi, LCSW": {
        "revenue": 11139.0,
        "sessions": 63,
        "clients": 23
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 16345.0,
        "sessions": 75,
        "clients": 24
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 3150.0,
        "sessions": 12,
        "clients": 6
      },
      "Apeksha Mehta, MHC-LP": {
        "revenue": 17980.0,
        "sessions": 86,
        "clients": 27
      }
    }
  },
  "2025-06": {
    "revenue": 99402.0,
    "sessions": 472,
    "activeClients": 113,
    "newClients": 7,
    "churnedClients": 9,
    "clinicians": {
      "Gajan Gugendiran, LMHC": {
        "revenue": 19135.0,
        "sessions": 90,
        "clients": 28
      },
      "Tamanna Ahmad, LMSW": {
        "revenue": 13480.0,
        "sessions": 62,
        "clients": 24
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 8730.0,
        "sessions": 40,
        "clients": 17
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 15660.0,
        "sessions": 73,
        "clients": 19
      },
      "Apeksha Mehta, MHC-LP": {
        "revenue": 18036.0,
        "sessions": 87,
        "clients": 25
      },
      "Riddhi Cidambi, LCSW": {
        "revenue": 14771.0,
        "sessions": 77,
        "clients": 27
      },
      "Deepa Saharia, LMSW": {
        "revenue": 5640.0,
        "sessions": 28,
        "clients": 11
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 3950.0,
        "sessions": 15,
        "clients": 6
      }
    }
  },
  "2025-07": {
    "revenue": 100720.0,
    "sessions": 475,
    "activeClients": 101,
    "newClients": 1,
    "churnedClients": 21,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 5085.0,
        "sessions": 19,
        "clients": 7
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 21640.0,
        "sessions": 100,
        "clients": 21
      },
      "Riddhi Cidambi, LCSW": {
        "revenue": 17995.0,
        "sessions": 88,
        "clients": 28
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 19660.0,
        "sessions": 92,
        "clients": 27
      },
      "Deepa Saharia, LMSW": {
        "revenue": 7795.0,
        "sessions": 39,
        "clients": 10
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 13020.0,
        "sessions": 62,
        "clients": 19
      },
      "Apeksha Mehta, MHC-LP": {
        "revenue": 15525.0,
        "sessions": 75,
        "clients": 24
      }
    }
  },
  "2025-08": {
    "revenue": 80373.0,
    "sessions": 387,
    "activeClients": 98,
    "newClients": 1,
    "churnedClients": 23,
    "clinicians": {
      "Gaya Kodiyalam, LCSW": {
        "revenue": 5990.0,
        "sessions": 22,
        "clients": 7
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 13190.0,
        "sessions": 69,
        "clients": 22
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 12040.0,
        "sessions": 57,
        "clients": 25
      },
      "Apeksha Mehta, MHC-LP": {
        "revenue": 13760.0,
        "sessions": 67,
        "clients": 22
      },
      "Riddhi Cidambi, LCSW": {
        "revenue": 12718.0,
        "sessions": 63,
        "clients": 24
      },
      "Deepa Saharia, LMSW": {
        "revenue": 4550.0,
        "sessions": 24,
        "clients": 9
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 18125.0,
        "sessions": 85,
        "clients": 22
      }
    }
  },
  "2025-09": {
    "revenue": 86502.0,
    "sessions": 416,
    "activeClients": 91,
    "newClients": 2,
    "churnedClients": 14,
    "clinicians": {
      "Apeksha Mehta, MHC-LP": {
        "revenue": 14600.0,
        "sessions": 71,
        "clients": 23
      },
      "Riddhi Cidambi, LCSW": {
        "revenue": 15982.0,
        "sessions": 78,
        "clients": 24
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 16375.0,
        "sessions": 77,
        "clients": 25
      },
      "Gaya Kodiyalam, LCSW": {
        "revenue": 900.0,
        "sessions": 3,
        "clients": 3
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 18195.0,
        "sessions": 84,
        "clients": 17
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 12915.0,
        "sessions": 65,
        "clients": 20
      },
      "Deepa Saharia, LMSW": {
        "revenue": 6125.0,
        "sessions": 30,
        "clients": 9
      },
      "Ranya Pohoomull, LMSW": {
        "revenue": 1410.0,
        "sessions": 8,
        "clients": 4
      }
    }
  },
  "2025-10": {
    "revenue": 93467.0,
    "sessions": 453,
    "activeClients": 100,
    "newClients": 7,
    "churnedClients": 12,
    "clinicians": {
      "Gajan Gugendiran, LMHC": {
        "revenue": 18160.0,
        "sessions": 85,
        "clients": 28
      },
      "Deepa Saharia, LMSW": {
        "revenue": 7310.0,
        "sessions": 35,
        "clients": 9
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 11900.0,
        "sessions": 55,
        "clients": 19
      },
      "Apeksha Mehta, MHC-LP": {
        "revenue": 15130.0,
        "sessions": 75,
        "clients": 22
      },
      "Riddhi Cidambi, LCSW": {
        "revenue": 16007.0,
        "sessions": 79,
        "clients": 22
      },
      "Ranya Pohoomull, LMSW": {
        "revenue": 5660.0,
        "sessions": 33,
        "clients": 12
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 15735.0,
        "sessions": 72,
        "clients": 16
      },
      "Vikramjit Bal, LMSW": {
        "revenue": 3565.0,
        "sessions": 19,
        "clients": 10
      }
    }
  },
  "2025-11": {
    "revenue": 81832.0,
    "sessions": 404,
    "activeClients": 100,
    "newClients": 1,
    "churnedClients": 8,
    "clinicians": {
      "Gajan Gugendiran, LMHC": {
        "revenue": 16315.0,
        "sessions": 76,
        "clients": 26
      },
      "Deepa Saharia, LMSW": {
        "revenue": 4200.0,
        "sessions": 21,
        "clients": 8
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 10445.0,
        "sessions": 48,
        "clients": 15
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 10015.0,
        "sessions": 45,
        "clients": 18
      },
      "Apeksha Mehta, MHC-LP": {
        "revenue": 11860.0,
        "sessions": 60,
        "clients": 23
      },
      "Riddhi Cidambi, LCSW": {
        "revenue": 13147.0,
        "sessions": 66,
        "clients": 22
      },
      "Ranya Pohoomull, LMSW": {
        "revenue": 6285.0,
        "sessions": 35,
        "clients": 12
      },
      "Vikramjit Bal, LMSW": {
        "revenue": 7665.0,
        "sessions": 41,
        "clients": 10
      },
      "Paulomi Mehta, MHC-LP, LAC": {
        "revenue": 1600.0,
        "sessions": 10,
        "clients": 5
      },
      "Preeti Rijal, LMSW": {
        "revenue": 300.0,
        "sessions": 2,
        "clients": 2
      }
    }
  },
  "2025-12": {
    "revenue": 13326.0,
    "sessions": 65,
    "activeClients": 52,
    "newClients": 0,
    "churnedClients": 53,
    "clinicians": {
      "Preeti Rijal, LMSW": {
        "revenue": 300.0,
        "sessions": 2,
        "clients": 2
      },
      "Gajan Gugendiran, LMHC": {
        "revenue": 1280.0,
        "sessions": 6,
        "clients": 6
      },
      "Mehar Ahuja, MHC-LP": {
        "revenue": 2995.0,
        "sessions": 14,
        "clients": 12
      },
      "Rebecca Singh, MHC-LP": {
        "revenue": 630.0,
        "sessions": 3,
        "clients": 3
      },
      "Apeksha Mehta, MHC-LP": {
        "revenue": 1675.0,
        "sessions": 8,
        "clients": 8
      },
      "Riddhi Cidambi, LCSW": {
        "revenue": 2751.0,
        "sessions": 13,
        "clients": 13
      },
      "Vikramjit Bal, LMSW": {
        "revenue": 1795.0,
        "sessions": 9,
        "clients": 7
      },
      "Paulomi Mehta, MHC-LP, LAC": {
        "revenue": 550.0,
        "sessions": 3,
        "clients": 2
      },
      "Deepa Saharia, LMSW": {
        "revenue": 800.0,
        "sessions": 4,
        "clients": 4
      },
      "Ranya Pohoomull, LMSW": {
        "revenue": 550.0,
        "sessions": 3,
        "clients": 3
      }
    }
  }
};

// Practice settings (static values - must match paymentData.ts)
const PRACTICE_SETTINGS = {
  capacity: 23,
  currentOpenings: 18,
  attendance: {
    showRate: 0.71,
    clientCancelled: 0.24,
    lateCancelled: 0.03,
    clinicianCancelled: 0.03,
    rebookRate: 0.83,
  },
  outstandingNotesPercent: 0.22,
  churnWindowDays: 60,
};

// Verify auth token
async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const decoded = atob(token);
    const parts = decoded.split(':');
    if (parts.length < 3) return false;
    
    const username = parts[0];
    const timestamp = parts[1];
    const signature = parts.slice(2).join(':');
    
    // Check token age (valid for 24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return false;
    }
    
    // Verify signature
    const payload = `${username}:${timestamp}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const expectedSig = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );
    const expectedSigBase64 = btoa(String.fromCharCode(...new Uint8Array(expectedSig)));
    
    return signature === expectedSigBase64;
  } catch {
    return false;
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const allowedOrigin = env.ALLOWED_ORIGIN || 'https://cortexa.pages.dev';

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Check authorization
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers }
    );
  }

  const token = authHeader.slice(7);
  const isValid = await verifyToken(token, env.AUTH_SECRET);
  
  if (!isValid) {
    return new Response(
      JSON.stringify({ error: 'Invalid or expired token' }),
      { status: 401, headers }
    );
  }

  // Parse query parameters
  const url = new URL(request.url);
  const month = url.searchParams.get('month'); // e.g., "2025-11"

  if (month && METRICS_DATA[month]) {
    return new Response(
      JSON.stringify({
        month,
        metrics: METRICS_DATA[month],
        settings: PRACTICE_SETTINGS
      }),
      { status: 200, headers }
    );
  }

  // Return all data
  return new Response(
    JSON.stringify({
      metrics: METRICS_DATA,
      settings: PRACTICE_SETTINGS,
      availableMonths: Object.keys(METRICS_DATA).sort()
    }),
    { status: 200, headers }
  );
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const allowedOrigin = context.env.ALLOWED_ORIGIN || 'https://cortexa.pages.dev';

  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
