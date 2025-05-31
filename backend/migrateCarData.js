// backend/scripts/migrateCarData.js
require("dotenv").config({ path: "./.env" }); // Sesuaikan path ke .env utama backend Anda
const mongoose = require("mongoose");
const connectDB = require("./config/db"); // Path ke koneksi DB Anda
const CarData = require("./models/carDataModels"); // Path ke model CarData Anda

// Data dari carData.js Anda (salin dan tempel di sini)
const carDataJs = {
  Toyota: {
    ImgUrl: "/images/Carbrand/toyota.png",
    Model: {
      Avanza: [
        "1.3 E M/T",
        "1.3 E CVT",
        "1.5 G M/T",
        "1.5 G CVT",
        "1.5 Veloz M/T",
        "1.5 Veloz CVT",
      ],
      Innova: [
        "2.0 G M/T",
        "2.0 G CVT",
        "2.4 V M/T",
        "2.4 V CVT",
        "2.4 Venturer M/T",
        "2.4 Venturer CVT",
        "Zenix 2.0 G CVT",
        "Zenix Hybrid 2.0 Q CVT",
      ],
      Fortuner: [
        "2.4 G M/T 4x2",
        "2.4 G A/T 4x2",
        "2.4 VRZ A/T 4x2",
        "2.8 GR Sport A/T 4x2",
        "2.4 G A/T 4x4",
        "2.8 GR Sport A/T 4x4",
      ],
      Rush: [
        "1.5 G M/T",
        "1.5 G A/T",
        "1.5 S GR Sport M/T",
        "1.5 S GR Sport A/T",
      ],
      Yaris: [
        "1.5 E M/T",
        "1.5 G CVT",
        "1.5 TRD Sportivo M/T",
        "1.5 TRD Sportivo CVT",
        "1.5 Cross CVT",
        "1.5 Cross Hybrid CVT",
      ],
      Agya: [
        "1.2 E M/T",
        "1.2 G M/T",
        "1.2 G CVT",
        "1.2 GR Sport M/T",
        "1.2 GR Sport CVT",
      ],
      Veloz: ["1.5 M/T", "1.5 Q CVT", "1.5 Q CVT TSS"],
      Camry: ["2.5 V A/T", "2.5 Hybrid A/T"],
      Corolla: [
        "1.8 Altis CVT",
        "1.8 Altis Hybrid CVT",
        "1.8 Cross CVT",
        "1.8 Cross Hybrid CVT",
        "GR 1.6 Turbo M/T",
      ],
      Alphard: ["2.5 X A/T", "2.5 G A/T", "3.5 Q A/T"],
      Vellfire: ["2.5 HEV CVT"],
      Voxy: ["2.0 CVT"],
      Hiace: ["2.5 Standard M/T", "2.5 Commuter M/T", "2.5 Premio M/T"],
      LandCruiser: ["300 VX-R 3.3L Diesel Twin-Turbo"],
      Raize: [
        "1.0T G M/T",
        "1.0T G CVT",
        "1.0T GR Sport CVT",
        "1.0T GR Sport CVT TSS",
      ],
      Hilux: [
        "2.0 Single Cabin M/T",
        "2.4 Single Cabin Diesel M/T",
        "2.4 Double Cabin V A/T 4x4",
        "2.4 Rangga Box Diesel M/T",
      ],
      GR86: ["2.4 M/T", "2.4 A/T"],
      GRSupra: ["3.0 A/T"],
      bZ4X: ["Electric A/T"],
    },
  },
  Honda: {
    ImgUrl: "/images/Carbrand/honda.png",
    Model: {
      Brio: [
        "1.2 S M/T",
        "1.2 E M/T",
        "1.2 E CVT",
        "1.2 RS M/T",
        "1.2 RS CVT",
        "1.2 Satya M/T",
        "1.2 Satya CVT",
      ],
      HRV: ["1.5 S M/T", "1.5 E CVT", "1.5 SE CVT", "1.5 RS CVT"],
      CRV: [
        "2.0L CVT",
        "1.5L Turbo CVT",
        "1.5L Turbo RS CVT",
        "2.0L Hybrid RS e:HEV",
      ],
      Civic: ["1.5 RS CVT", "2.0 Type R M/T"],
      Mobilio: ["1.5 S M/T", "1.5 E M/T", "1.5 E CVT", "1.5 RS CVT"],
      City: ["1.5 E CVT", "1.5 RS CVT"],
      CityHatchback: ["1.5 RS CVT"],
      Accord: ["1.5 VTEC Turbo CVT", "2.0 Hybrid CVT"],
      WRV: ["1.5 E M/T", "1.5 RS CVT", "1.5 RS CVT Honda Sensing"],
      BRV: [
        "1.5 S M/T",
        "1.5 E M/T",
        "1.5 Prestige CVT",
        "1.5 Prestige CVT Honda Sensing",
      ],
    },
  },
  Daihatsu: {
    ImgUrl: "/images/Carbrand/daihatsu.png",
    Model: {
      Xenia: [
        "1.3 X M/T",
        "1.3 X CVT",
        "1.5 R M/T",
        "1.5 R CVT",
        "1.5 R Custom CVT",
      ],
      Terios: [
        "1.5 X M/T",
        "1.5 X CVT",
        "1.5 R M/T",
        "1.5 R CVT",
        "1.5 R Custom CVT",
      ],
      Sigra: [
        "1.0 D M/T",
        "1.0 M M/T",
        "1.2 X M/T",
        "1.2 X CVT",
        "1.2 R M/T",
        "1.2 R CVT",
      ],
      Ayla: ["1.0 D M/T", "1.0 M M/T", "1.2 X M/T", "1.2 X CVT", "1.2 R CVT"],
      GranMax: ["1.5 MB", "1.5 PU", "1.5 Blind Van"],
      Rocky: ["1.0T M", "1.0T X", "1.0T R", "1.0T ADS"],
      Luxio: ["1.5 X M/T", "1.5 D M/T", "1.5 M M/T"],
      Sirion: ["1.3 X CVT", "1.3 R CVT"],
    },
  },
  Suzuki: {
    ImgUrl: "/images/Carbrand/suzuki.png",
    Model: {
      Ertiga: [
        "1.5 GA M/T",
        "1.5 GL M/T",
        "1.5 GX M/T",
        "1.5 GX Hybrid M/T",
        "1.5 SS Hybrid CVT",
      ],
      XL7: [
        "1.5 Zeta M/T",
        "1.5 Beta M/T",
        "1.5 Alpha CVT",
        "1.5 Hybrid Beta CVT",
        "1.5 Hybrid Alpha CVT",
      ],
      Baleno: ["1.5 Hatchback CVT"],
      Ignis: ["1.2 GL M/T", "1.2 GX CVT"],
      Carry: ["1.5 Flat Deck M/T", "1.5 Wide Deck M/T", "1.5 Blind Van M/T"],
      APV: ["1.5 Arena M/T", "1.5 Luxury M/T"],
      Jimny: ["1.5 2WD M/T", "1.5 4WD M/T", "1.5 5-Door M/T"],
      SPresso: ["1.0 GL M/T", "1.0 GL+ AGS"],
    },
  },
  Mitsubishi: {
    ImgUrl: "/images/Carbrand/mitsubishi.png",
    Model: {
      Xpander: [
        "1.5 GLS M/T",
        "1.5 Exceed CVT",
        "1.5 Sport CVT",
        "1.5 Ultimate CVT",
        "1.5 Cross CVT",
      ],
      "Pajero Sport": [
        "2.4 Exceed M/T",
        "2.4 Dakar A/T",
        "2.4 Dakar Ultimate A/T",
        "2.4 Rockford Fosgate A/T",
      ],
      OutlanderPHEV: ["2.4 PHEV A/T"],
      Triton: [
        "2.5 GLX M/T",
        "2.5 HDX M/T",
        "2.5 Exceed A/T",
        "2.5 Ultimate A/T",
      ],
      L300: ["2.2 Cab Chassis M/T", "2.2 Pick Up M/T"],
      Mirage: ["1.2 GLX M/T", "1.2 Exceed CVT"],
    },
  },
  Bmw: {
    ImgUrl: "/images/Carbrand/bmw.png",
    Model: {
      Series3: ["318i Sport A/T", "320i M Sport A/T", "330i M Sport A/T"],
      Series5: ["520i M Sport A/T", "530i M Sport A/T"],
      Series7: ["730Li M Sport A/T", "740Li Opulence A/T"],
      X1: ["sDrive18i xLine A/T"],
      X3: ["xDrive20i M Sport A/T"],
      X5: ["xDrive40i xLine A/T", "xDrive40i M Sport A/T"],
      X7: ["xDrive40i Opulence A/T"],
      Z4: ["sDrive30i M Sport A/T"],
      i4: ["eDrive40 M Sport A/T"],
      iX: ["xDrive40 A/T", "xDrive50 A/T"],
    },
  },
  "Mercedes-Benz": {
    ImgUrl: "/images/Carbrand/mercedes.png",
    Model: {
      "A-Class": ["A 200 Progressive Line A/T", "A 250 AMG Line A/T"],
      "C-Class": ["C 200 Avantgarde Line A/T", "C 300 AMG Line A/T"],
      "E-Class": ["E 200 Avantgarde Line A/T", "E 300 AMG Line A/T"],
      "S-Class": ["S 450 L A/T"],
      GLA: ["GLA 200 Progressive Line A/T"],
      GLB: ["GLB 200 Progressive Line A/T", "GLB 250 AMG Line A/T"],
      GLC: ["GLC 200 AMG Line A/T", "GLC 300 AMG Line A/T"],
      GLE: ["GLE 450 4MATIC AMG Line A/T"],
      GLS: ["GLS 450 4MATIC AMG Line A/T"],
    },
  },
  Mazda: {
    ImgUrl: "/images/Carbrand/mazda.png",
    Model: {
      Mazda2: ["1.5 GT A/T", "1.5 R A/T"],
      Mazda3: ["2.0 Hatchback A/T", "2.0 Sedan A/T"],
      Mazda6: ["2.5 Elite Sedan A/T", "2.5 Elite Estate A/T"],
      CX3: ["1.5 Sport A/T", "1.5 Pro A/T"],
      CX5: ["2.5 Touring A/T", "2.5 Elite A/T", "2.5 Kuro A/T"],
      CX8: ["2.5 Elite A/T"],
      CX9: ["2.5 AWD A/T"],
      MX5: ["2.0 RF A/T", "2.0 Soft Top M/T"],
    },
  },
  Datsun: {
    ImgUrl: "/images/Carbrand/datsun.png",
    Model: {
      GO: ["1.2 D M/T", "1.2 A M/T", "1.2 T M/T", "1.2 T CVT"],
      GOPlus: ["1.2 D M/T", "1.2 A M/T", "1.2 T M/T", "1.2 T CVT"],
      Cross: ["1.2 M/T", "1.2 CVT"],
    },
  },
  Kia: {
    ImgUrl: "/images/Carbrand/kia.png",
    Model: {
      Picanto: ["1.2 GT Line A/T", "1.2 EX A/T"],
      Sonet: [
        "1.5 Standard M/T",
        "1.5 Active CVT",
        "1.5 Smart CVT",
        "1.5 Dynamic CVT",
        "1.5 Premiere CVT",
      ],
      Seltos: ["1.4 GT Line A/T", "1.5 EX CVT", "1.5 EX+ CVT"],
      Carens: ["1.5 Premiere CVT", "1.5 Premiere Turbo A/T"],
      Sportage: ["2.0 GT Line A/T"],
      Sorento: ["2.5 Signature A/T", "2.5 Diesel AWD A/T"],
      Carnival: ["2.2 Premiere A/T", "2.2 Signature A/T"],
    },
  },
  Renault: {
    ImgUrl: "/images/Carbrand/renault.png",
    Model: {
      Kwid: ["1.0 RXT M/T", "1.0 Climber AMT"],
      Triber: ["1.0 RXL M/T", "1.0 RXT AMT", "1.0 RXZ AMT"],
      Koleos: ["2.5 Signature A/T"],
      Duster: ["1.5 RXZ AWD M/T"],
    },
  },
  Hyundai: {
    ImgUrl: "/images/Carbrand/hyundai.png",
    Model: {
      GrandI10: ["1.2 GL M/T", "1.2 GLX A/T"],
      Accent: ["1.4 GL M/T", "1.4 GLX A/T"],
      Creta: [
        "1.5 Active M/T",
        "1.5 Trend CVT",
        "1.5 Style CVT",
        "1.5 Prime CVT",
      ],
      SantaFe: ["2.5 GDI A/T", "2.2 CRDi AWD A/T"],
      Palisade: ["2.2 AWD Signature A/T"],
      Staria: ["2.2 Signature 7-Seater A/T", "2.2 Signature 9-Seater A/T"],
      Ioniq5: ["Standard Range A/T", "Long Range A/T"],
      KonaElectric: ["39.2 kWh A/T", "64 kWh A/T"],
    },
  },
  Nissan: {
    ImgUrl: "/images/Carbrand/nissan.png",
    Model: {
      Qashqai: ["1.2 GL M/T", "1.2 GLX A/T"],
      Micra: ["1.2 GL M/T", "1.2 GLX A/T"],
      Note: ["1.5 GL M/T", "1.5 GLX A/T"],
      Juke: ["1.5 GL M/T", "1.5 GLX A/T"],
      "Grand Livina": ["2.5 GL A/T", "2.5 GLX A/T"],
    },
  },
};

const migrateData = async () => {
  await connectDB();

  try {
    await CarData.deleteMany({});
    console.log("Koleksi CarData lama berhasil dihapus (jika ada).");

    let brandsCreated = 0;
    let modelsCreated = 0;
    let variantsCreated = 0;
    let brandsUpdated = 0;

    for (const brandNameJs in carDataJs) {
      if (Object.hasOwnProperty.call(carDataJs, brandNameJs)) {
        const brandDetailsJs = carDataJs[brandNameJs];
        let brandNeedsSave = false;

        let brandEntry = await CarData.findOne({ brandName: brandNameJs });

        if (!brandEntry) {
          brandEntry = new CarData({
            brandName: brandNameJs,
            imgUrl: brandDetailsJs.ImgUrl || "/images/Carbrand/default.png",
            models: [],
          });
          // Tidak perlu save di sini, save di akhir setelah semua modifikasi
          brandsCreated++;
          brandNeedsSave = true; // Tetap tandai untuk save karena ini brand baru
          console.log(`Merek '${brandNameJs}' akan dibuat.`);
        } else {
          console.log(`Merek '${brandNameJs}' sudah ada.`);
          if (
            brandDetailsJs.ImgUrl &&
            brandEntry.imgUrl !== brandDetailsJs.ImgUrl
          ) {
            brandEntry.imgUrl = brandDetailsJs.ImgUrl;
            brandNeedsSave = true;
            brandsUpdated++;
            console.log(`  ImgUrl untuk merek '${brandNameJs}' akan diupdate.`);
          }
          if (!Array.isArray(brandEntry.models)) {
            brandEntry.models = [];
            brandNeedsSave = true;
          }
        }

        if (brandDetailsJs.Model && typeof brandDetailsJs.Model === "object") {
          for (const modelNameJs in brandDetailsJs.Model) {
            if (Object.hasOwnProperty.call(brandDetailsJs.Model, modelNameJs)) {
              const variantsArrayJs = brandDetailsJs.Model[modelNameJs];

              let modelIndex = brandEntry.models.findIndex(
                (m) => m.name === modelNameJs
              );
              let modelInBrand;

              if (modelIndex === -1) {
                const newModelObject = { name: modelNameJs, variants: [] };
                brandEntry.models.push(newModelObject);
                // Dapatkan referensi ke objek yang baru di-push untuk modifikasi lebih lanjut
                modelInBrand = brandEntry.models[brandEntry.models.length - 1];
                modelsCreated++;
                brandNeedsSave = true;
                console.log(
                  `  Model '${modelNameJs}' akan ditambahkan ke '${brandNameJs}'.`
                );
              } else {
                modelInBrand = brandEntry.models[modelIndex]; // Referensi ke model yang sudah ada
                if (!Array.isArray(modelInBrand.variants)) {
                  modelInBrand.variants = [];
                  brandNeedsSave = true;
                }
                console.log(
                  `  Model '${modelNameJs}' sudah ada di '${brandNameJs}'.`
                );
              }

              if (Array.isArray(variantsArrayJs)) {
                for (const variantNameJs of variantsArrayJs) {
                  const variantExists = modelInBrand.variants.some(
                    (v) => v.name === variantNameJs
                  );
                  if (!variantExists) {
                    modelInBrand.variants.push({ name: variantNameJs });
                    variantsCreated++;
                    brandNeedsSave = true; // Tandai bahwa ada perubahan
                    console.log(
                      `    Varian '${variantNameJs}' akan ditambahkan ke '${modelNameJs}'.`
                    );
                  } else {
                    console.log(
                      `    Varian '${variantNameJs}' sudah ada di '${modelNameJs}'.`
                    );
                  }
                }
              }
            }
          }
        }

        if (brandNeedsSave) {
          // Jika brandEntry adalah dokumen Mongoose yang sudah ada,
          // Mongoose akan melacak perubahan pada array models dan subdokumennya.
          await brandEntry.save();
          console.log(
            `Data untuk merek '${brandNameJs}' berhasil disimpan/diperbarui.`
          );
        }
      }
    }

    console.log("\n--- Ringkasan Migrasi ---");
    console.log(`Merek baru dibuat: ${brandsCreated}`);
    console.log(`Merek diupdate (ImgUrl): ${brandsUpdated}`);
    console.log(`Model baru ditambahkan: ${modelsCreated}`);
    console.log(`Varian baru ditambahkan: ${variantsCreated}`);
    console.log("Migrasi data selesai.");
  } catch (error) {
    console.error("Error selama migrasi data:", error);
    if (error.code === 11000) {
      console.error(
        "Error duplikasi terdeteksi. Pastikan nama merek unik jika membuat baru."
      );
    }
  } finally {
    await mongoose.connection.close();
    console.log("Koneksi MongoDB ditutup.");
  }
};

migrateData();
