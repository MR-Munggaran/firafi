// File ini TIDAK pakai "use server" — hanya data konstanta
// Import dari sini di komponen client maupun server

export interface AllocationRule {
  category: string;
  percent:  number;
  label:    string;
}

export interface AllocationPreset {
  name:  string;
  rules: AllocationRule[];
}

export const PRESET_TEMPLATES: AllocationPreset[] = [
  {
    name: "50/30/20",
    rules: [
      { category: "🍔 Makanan & Minuman", percent: 15, label: "Makan"      },
      { category: "🏠 Rumah & Tagihan",   percent: 20, label: "Tagihan"    },
      { category: "🚗 Transportasi",       percent: 10, label: "Transport"  },
      { category: "💊 Kesehatan",          percent: 5,  label: "Kesehatan"  },
      { category: "🎮 Hiburan",            percent: 10, label: "Hiburan"    },
      { category: "💑 Pacaran",            percent: 10, label: "Pacaran"    },
      { category: "👗 Fashion",            percent: 10, label: "Fashion"    },
      { category: "💰 Tabungan",           percent: 20, label: "Tabungan"   },
    ],
  },
  {
    name: "Couple Hemat",
    rules: [
      { category: "🍔 Makanan & Minuman", percent: 20, label: "Makan"      },
      { category: "🏠 Rumah & Tagihan",   percent: 25, label: "Tagihan"    },
      { category: "🚗 Transportasi",       percent: 10, label: "Transport"  },
      { category: "💊 Kesehatan",          percent: 5,  label: "Kesehatan"  },
      { category: "🎮 Hiburan",            percent: 5,  label: "Hiburan"    },
      { category: "💑 Pacaran",            percent: 5,  label: "Pacaran"    },
      { category: "💰 Tabungan",           percent: 30, label: "Tabungan"   },
    ],
  },
  {
    name: "YOLO Couple",
    rules: [
      { category: "🍔 Makanan & Minuman", percent: 20, label: "Makan"      },
      { category: "🏠 Rumah & Tagihan",   percent: 20, label: "Tagihan"    },
      { category: "🚗 Transportasi",       percent: 10, label: "Transport"  },
      { category: "🎮 Hiburan",            percent: 15, label: "Hiburan"    },
      { category: "💑 Pacaran",            percent: 15, label: "Pacaran"    },
      { category: "✈️ Liburan",            percent: 10, label: "Liburan"    },
      { category: "💰 Tabungan",           percent: 10, label: "Tabungan"   },
    ],
  },
];