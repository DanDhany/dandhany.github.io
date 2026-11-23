/* Bilingual copy for the site.
   Indonesian stays the source of truth: the Indonesian string in the markup is
   also the lookup key, so the translator walks text nodes and attributes once
   instead of tagging every element. Runtime strings built by the 3D module use
   the t() keys at the bottom of this file. */

const EN = {
  /* ------------------------------------------------------------ chrome */
  "Lewati ke daftar proyek": "Skip to the project list",
  "Navigasi utama": "Main navigation",
  "Proyek": "Projects",
  "Tentang": "About",
  "Kontak": "Contact",
  "Pilih bahasa": "Choose language",

  /* -------------------------------------------------------------- hero */
  "Portofolio · Sidoarjo, Jawa Timur": "Portfolio · Sidoarjo, East Java",
  "IT di instansi pemerintah · Laravel, server, database":
    "IT in a government agency · Laravel, servers, databases",
  "Lima belas proyek berdiri sebagai resto di satu jalan pesisir. Nyalakan mesin dan susuri jalannya, atau buka menu kalau ingin membaca semuanya tanpa mengemudi.":
    "Fifteen projects stand as diners along one coastal road. Start the engine and follow the road, or open the menu if you would rather read everything without driving.",
  "Nyalakan mesin": "Start the engine",
  "Buka menu": "Open menu",

  /* --------------------------------------------------------------- hud */
  "Resto": "Diner",
  "Papan nama pertama ada di sisi kiri jalan.":
    "The first sign is on the left side of the road.",
  "Suasana": "Mood",
  "Senja": "Sunset",
  "Pilih suasana cahaya": "Choose the light mood",
  "Pesisir": "Coast",
  "Malam": "Night",
  "Peta jalan. Titik menandai resto di depan. Gunakan menu proyek untuk melompat ke resto tertentu.":
    "Road map. Dots mark the diners ahead. Use the project menu to jump to a diner.",
  "km/j": "km/h",
  "Masuk ke": "Enter",
  "Kendali kendaraan": "Vehicle controls",
  "Rem": "Brake",
  "Belok kiri": "Steer left",
  "Kiri": "Left",
  "Belok kanan": "Steer right",
  "Kanan": "Right",
  "W / S gas dan rem · A / D belok · E masuk resto · Esc menu":
    "W / S gas and brake · A / D steer · E enter diner · Esc menu",
  "Jelajah bebas": "Free roam",

  /* ------------------------------------------------------------ explore */
  "Mode jelajah": "Explore mode",
  "Resto sebelumnya": "Previous diner",
  "Resto berikutnya": "Next diner",
  "Peta jalan": "Road map",
  "Perkecil": "Zoom out",
  "Perbesar": "Zoom in",
  "Berkendara": "Drive",
  "Geser untuk menggeser, Shift geser untuk memutar, roda untuk zoom. Klik bangunan untuk membuka detailnya.":
    "Drag to pan, Shift drag to orbit, scroll to zoom. Click a building to open its details.",

  /* --------------------------------------------------------- pause menu */
  "Jeda": "Paused",
  "Bagian menu": "Menu sections",
  "Lanjut": "Resume",
  "Indeks proyek": "Project index",
  "Lima belas bangunan di sepanjang jalan": "Fifteen buildings along the road",
  "Tiap baris adalah satu resto. Tekan tombolnya, menu menutup, dan mobil membawa Anda ke bangunan itu. Panel detailnya terbuka sendiri setelah tiba.":
    "Each row is one diner. Press its button, the menu closes, and the car takes you to that building. The detail panel opens by itself on arrival.",
  "Kemudikan ke sini": "Drive here",

  /* ------------------------------------------------------------ project 1 */
  "SIPENO": "SIPENO",
  "Sistem Perjalanan Dinas": "Official travel system",
  "Surat tugas dan rincian biaya, rapi dalam satu meja.":
    "Travel orders and cost breakdowns, tidy on one desk.",
  "Sistem web perjalanan dinas untuk instansi pemerintah: pembuatan dan rekapitulasi bulanan dokumen pertanggungjawaban, mulai dari surat tugas, nota dinas, surat perintah perjalanan dinas, sampai rincian biaya tiap perjalanan.":
    "A web system for official travel at a government agency: creating and monthly recapping of accountability documents, from travel orders and internal notes to travel permits and the cost breakdown of every trip.",
  "Tangkapan layar SIPENO: surat tugas, rincian biaya, dan rekap perjalanan dinas.":
    "SIPENO screenshot: travel orders, cost breakdowns, and the official travel recap.",

  /* ------------------------------------------------------------ project 2 */
  "Website Biro Umum": "Biro Umum Website",
  "Informasi dan dokumen daerah": "Regional information and documents",
  "Informasi biro dan dokumen resmi, tinggal unduh.":
    "Bureau news and official documents, ready to download.",
  "Situs tempat sekretariat daerah dan instansi lain membaca informasi terbaru biro, sekaligus mengunduh dokumen pendukung seperti peraturan daerah dan hasil survei kepuasan masyarakat.":
    "A site where the regional secretariat and other agencies read the bureau's latest news and download supporting documents such as regional regulations and public satisfaction survey results.",
  "Tangkapan layar situs Biro Umum: halaman informasi dan daftar dokumen.":
    "Biro Umum site screenshot: an information page and a document list.",

  /* ------------------------------------------------------------ project 3 */
  "PerformAPP360": "PerformAPP360",
  "Penilaian kinerja 360 derajat": "360 degree performance review",
  "Penilaian dari segala arah, direkap otomatis.":
    "Reviews from every direction, recapped automatically.",
  "Sistem informasi penilaian kinerja dengan umpan balik 360 derajat dari atasan langsung. Banyak penilai, banyak kriteria dan subkriteria, dengan grafik interaktif untuk membaca tren kinerja serta rekap nilai rata-rata per karyawan dan per divisi.":
    "A performance appraisal system with 360 degree feedback from direct supervisors. Many reviewers, many criteria and sub-criteria, with interactive charts for reading performance trends and the average score recap per employee and per division.",
  "Tangkapan layar PerformAPP360: dasbor penilaian, angket, dan grafik kinerja.":
    "PerformAPP360 screenshot: the appraisal dashboard, questionnaires, and performance charts.",

  /* ------------------------------------------------------------ project 4 */
  "Presensi Syahid": "Presensi Syahid",
  "Absensi karyawan": "Employee attendance",
  "Absen dari ponsel, rekap langsung jadi.":
    "Clock in from your phone, the recap writes itself.",
  "Aplikasi absensi pengganti mesin checklock. Karyawan mengajukan izin dan melihat rekap absensi bulanan dari ponsel, sementara admin menyusun data absensi, izin, dan cuti tiap karyawan serta mengatur hari khusus.":
    "An attendance app that replaces the checklock machine. Employees file leave requests and read their monthly attendance recap from their phone, while admins compile each employee's attendance, permits, and leave, and set special dates.",
  "Tangkapan layar Presensi Syahid: dasbor admin dan aplikasi absensi Android.":
    "Presensi Syahid screenshot: the admin dashboard and the Android attendance app.",

  /* ------------------------------------------------------------ project 5 */
  "Newtown App": "Newtown App",
  "Kasir toko bangunan": "Hardware store cashier",
  "Toko bangunan: jual, beli, stok, cetak nota.":
    "Hardware store: sales, purchases, stock, printed receipts.",
  "Aplikasi point of sale desktop untuk toko bangunan UMKM. Mencatat transaksi penjualan dan pembelian, mengelola stok, barang, pelanggan, dan pemasok, lalu mencetak nota transaksi serta laporan stok.":
    "A desktop point of sale app for small hardware stores. It records sales and purchase transactions, manages stock, products, customers, and suppliers, and prints transaction receipts and stock reports.",
  "Tangkapan layar Newtown App: dasbor kasir, laporan penjualan, dan laporan stok.":
    "Newtown App screenshot: the cashier dashboard, sales reports, and stock reports.",

  /* ------------------------------------------------------------ project 6 */
  "Fooder": "Fooder",
  "Pesanan dari meja": "Ordering from the table",
  "Pesan dari meja, langsung ke dapur.":
    "Order from the table, straight to the kitchen.",
  "Aplikasi manajemen restoran desktop. Pelanggan memesan sendiri lewat komputer di tiap meja, pesanan langsung masuk ke koki, dan pelanggan cukup membawa struk ke kasir untuk membayar.":
    "A desktop restaurant management app. Customers order for themselves on the computer at each table, orders go straight to the cooks, and customers just take the receipt to the cashier to pay.",
  "Tangkapan layar Fooder: menu pelanggan dan halaman pesanan restoran.":
    "Fooder screenshot: the customer menu and the restaurant order page.",

  /* ------------------------------------------------------------ project 7 */
  "Mediafood": "Mediafood",
  "Pesan lewat barcode": "Ordering by barcode",
  "Pindai barcode, pesan dari ponsel sendiri.":
    "Scan the barcode, order from your own phone.",
  "Versi lanjutan dari Fooder. Pelanggan memesan lewat ponsel masing-masing dengan memindai barcode di meja, jadi restoran tidak perlu menyediakan satu perangkat per meja. Pelayan juga bisa memantau pesanan yang masih menunggu di dapur.":
    "A follow-up to Fooder. Customers order on their own phones by scanning the barcode on the table, so the restaurant does not need one device per table. Waiters can also watch the orders still waiting in the kitchen.",
  "Tangkapan layar Mediafood: pesanan dari ponsel dan halaman pesanan masuk.":
    "Mediafood screenshot: ordering from a phone and the incoming orders page.",

  /* ------------------------------------------------------------ project 8 */
  "PlayForgeX": "PlayForgeX",
  "Migrasi playlist antar layanan musik": "Moving playlists between music services",
  "Pindahkan playlist antar layanan musik, simpan di server sendiri.":
    "Move playlists between music services, keep them on your own server.",
  "Aplikasi self-hosted untuk memindahkan, menggabungkan, dan menyusun ulang playlist lintas YouTube Music, YouTube, Apple Music, Spotify, SoundCloud, Deezer, dan file lokal (M3U, CSV, JSON). Bisa menghubungkan beberapa akun sekaligus, memisahkan data antar pengguna, dan menyimpan semua kredensial di database lokal.":
    "A self-hosted app for moving, merging, and rearranging playlists across YouTube Music, YouTube, Apple Music, Spotify, SoundCloud, Deezer, and local files (M3U, CSV, JSON). It can link several accounts at once, keep each user's data apart, and store every credential in a local database.",
  "Kartu repo GitHub PlayForgeX.": "PlayForgeX GitHub repo card.",

  /* ------------------------------------------------------------ project 9 */
  "ForgeX": "ForgeX",
  "Skill untuk agen koding": "A skill for coding agents",
  "Satu skill untuk agen koding yang membangun lintas stack.":
    "One skill for coding agents building across the stack.",
  "Skill terbuka untuk agen koding seperti Claude Code, Codex, dan Cursor. Isinya panduan kerja yang menekankan UI/UX lebih dulu, konsistensi antar stack, pengujian, keamanan, dan serah terima pekerjaan antar sesi. Dirilis dengan lisensi MIT dan terdaftar di skills.sh.":
    "An open skill for coding agents such as Claude Code, Codex, and Cursor. It holds working guidance that puts UI/UX first, then consistency across stacks, testing, security, and handing work over between sessions. Released under the MIT license and listed on skills.sh.",
  "Kartu repo GitHub ForgeX Full-Stack Engineer.":
    "ForgeX Full-Stack Engineer GitHub repo card.",

  /* ----------------------------------------------------------- project 10 */
  "LAMP Stack Debian": "LAMP Stack Debian",
  "Panel server dan multi-PHP": "Server panel and multi-PHP",
  "Debian 12 bersih jadi server web multi-PHP, satu perintah.":
    "A clean Debian 12 into a multi-PHP web server, one command.",
  "Skrip otomasi yang mengubah Debian 12 menjadi server pengembangan lengkap dengan panel kontrol berbasis web: monitoring CPU, RAM, dan penyimpanan, file manager, web SSH, phpMyAdmin, serta manajemen beberapa versi PHP (7.4 dan 8.2) yang bisa dijalankan terpisah per proyek.":
    "An automation script that turns Debian 12 into a complete development server with a web control panel: CPU, RAM, and storage monitoring, a file manager, web SSH, phpMyAdmin, and management of several PHP versions (7.4 and 8.2) that can run separately per project.",
  "Kartu repo GitHub LAMP stack Debian.": "LAMP stack Debian GitHub repo card.",

  /* ----------------------------------------------------------- project 11 */
  "PHP Switcher": "PHP Switcher",
  "Ganti versi PHP di Windows": "Switching PHP versions on Windows",
  "Ganti versi PHP di Windows dengan satu perintah.":
    "Switch PHP versions on Windows with one command.",
  "Utilitas command line untuk berpindah versi PHP di Windows tanpa mengatur environment variable secara manual. Berguna saat beberapa proyek menuntut versi PHP berbeda di satu komputer.":
    "A command line utility for switching PHP versions on Windows without setting environment variables by hand. Useful when several projects need different PHP versions on one machine.",
  "Kartu repo GitHub PHP Version Switcher.":
    "PHP Version Switcher GitHub repo card.",

  /* ----------------------------------------------------------- project 12 */
  "Materi AI": "Materi AI",
  "Presentasi AI vs Guru": "A presentation on AI and teachers",
  "Satu halaman untuk menjelaskan AI kepada guru.":
    "One page to explain AI to teachers.",
  "Situs presentasi satu halaman berisi materi pengantar kecerdasan buatan untuk guru: apa yang bisa dibantu AI, apa yang tetap tugas manusia, dan contoh pemakaiannya di kelas. Tanpa server, cukup dibuka di browser.":
    "A one-page presentation site with introductory material on artificial intelligence for teachers: what AI can help with, what stays a human job, and examples of using it in class. No server needed, it just opens in a browser.",
  "Kartu repo GitHub Materi AI.": "Materi AI GitHub repo card.",

  /* ----------------------------------------------------------- project 13 */
  "Tes Teknis TA": "Tes Teknis TA",
  "Uji teknis frontend": "A frontend technical test",
  "Uji teknis Vue 3, dari komponen sampai build.":
    "A Vue 3 technical test, from components to build.",
  "Repo uji teknis frontend dengan Vue 3 dan Vue CLI: komponen, struktur proyek, dan proses build produksi. Dipakai untuk menunjukkan cara kerja saya saat mengerjakan tugas teknis berbatas waktu.":
    "A frontend technical test repo built with Vue 3 and Vue CLI: components, project structure, and the production build. It shows how I work on a technical task with a deadline.",
  "Kartu repo GitHub Tes Teknis TA.": "Tes Teknis TA GitHub repo card.",

  /* ----------------------------------------------------------- project 14 */
  "Portofolio Lama": "Old Portfolio",
  "Versi pertama situs ini": "The first version of this site",
  "Versi pertama portofolio, sebelum dirombak.":
    "The first portfolio, before the rebuild.",
  "Situs portofolio versi pertama: halaman statis dengan CSS dan JavaScript, lampiran CV serta portofolio PDF, dan deploy lewat GitHub Pages. Versi yang sekarang menggantikannya dengan dunia 3D.":
    "The first version of the portfolio: a static page with CSS and JavaScript, CV and portfolio PDF attachments, deployed through GitHub Pages. The current version replaces it with a 3D world.",
  "Kartu repo GitHub Portofolio Lama.": "Old Portfolio GitHub repo card.",

  /* ----------------------------------------------------------- project 15 */
  "Medic Store App": "Medic Store App",
  "Kasir apotek": "Pharmacy cashier",
  "Kasir apotek, dibangun dengan Microsoft Access.":
    "A pharmacy cashier built with Microsoft Access.",
  "Aplikasi point of sales desktop untuk apotek yang dibangun dengan Microsoft Access. Salah satu proyek awal, sebelum saya berpindah ke PHP dan Laravel.":
    "A desktop point of sale app for a pharmacy, built with Microsoft Access. One of my early projects, before I moved to PHP and Laravel.",
  "Kartu proyek Medic Store App.": "Medic Store App project card.",

  /* Tech tags that read differently in English. */
  "PHP 7.4 dan 8.2": "PHP 7.4 and 8.2",
  "Presentasi": "Presentation",

  /* -------------------------------------------------------------- about */
  "Yang saya kerjakan di balik layar": "What I build behind the scenes",
  "Saya membangun sistem web dari sisi database sampai tombol terakhir. Sehari-hari memegang Laravel, PHP, dan MySQL, merawat server Debian, dan menulis aplikasi Android atau desktop ketika pekerjaannya menuntut.":
    "I build web systems from the database side down to the last button. Day to day I work with Laravel, PHP, and MySQL, look after Debian servers, and write Android or desktop apps when the job calls for it.",
  "Saya bekerja sebagai IT di sebuah instansi pemerintah, dan sebagian besar proyek di halaman ini lahir dari pekerjaan itu: sistem internal untuk pemerintahan, ditambah beberapa aplikasi untuk UMKM. Pekerjaannya lebih banyak soal alur kerja yang benar daripada tampilan yang ramai.":
    "I work in IT at a government agency, and most of the projects on this page grew out of that work: internal systems for government, plus a few apps for small businesses. The work is more about getting the workflow right than about a busy look.",
  "Kode yang bisa dibuka publik ada di GitHub, dari PlayForgeX dan ForgeX sampai skrip server Debian dan utilitas PHP di Windows.":
    "The code I can share publicly is on GitHub, from PlayForgeX and ForgeX to the Debian server script and the PHP utility for Windows.",
  "Berdasarkan di Sidoarjo, Jawa Timur. Terbuka untuk pekerjaan jarak jauh maupun di tempat.":
    "Based in Sidoarjo, East Java. Open to remote and on-site work.",
  "Pengalaman": "Experience",
  "Pranata Komputer Ahli Pertama": "Computer Administrator, First Level",
  "Instansi pemerintah, 2024–sekarang": "Government agency, 2024–present",
  "Tenaga Administrasi IT": "IT Administrative Staff",
  "Instansi pemerintah, 2022": "Government agency, 2022",
  "Tenaga Ahli IT": "IT Specialist",
  "Instansi pemerintah, 2021": "Government agency, 2021",
  "IT Developer": "IT Developer",
  "PT Syahid Husada Dewata, 2019": "PT Syahid Husada Dewata, 2019",
  "Assistant Cameraman": "Assistant Cameraman",
  "SBO TV, 2015": "SBO TV, 2015",
  "Perangkat kerja": "Toolset",
  "Laravel dan PHP": "Laravel and PHP",
  "Sistem internal": "Internal systems",
  "TypeScript dan Node.js": "TypeScript and Node.js",
  "PlayForgeX dan ForgeX": "PlayForgeX and ForgeX",
  "MySQL, MariaDB, PostgreSQL, SQL Server": "MySQL, MariaDB, PostgreSQL, SQL Server",
  "Basis data": "Databases",
  "Docker dan Docker Compose": "Docker and Docker Compose",
  "Kontainerisasi": "Containerisation",
  "Linux, Nginx, Apache": "Linux, Nginx, Apache",
  "Server Debian": "Debian servers",
  "Bootstrap dan jQuery": "Bootstrap and jQuery",
  "Antarmuka": "Interfaces",
  "Java": "Java",
  "Android dan desktop": "Android and desktop",
  "Git dan GitHub": "Git and GitHub",
  "26 repo publik": "26 public repos",
  "Pendidikan": "Education",
  "Universitas Dinamika (STIKOM Surabaya)": "Universitas Dinamika (STIKOM Surabaya)",
  "Sistem Informasi, 2016–2020, IPK 3,62": "Information Systems, 2016–2020, GPA 3.62",
  "SMK Negeri 2 Buduran": "SMK Negeri 2 Buduran",
  "Multimedia, 2013–2016": "Multimedia, 2013–2016",
  "Organisasi": "Organisations",
  "INTEGER": "INTEGER",
  "Publikasi dan dokumentasi, 2018": "Publication and documentation, 2018",
  "STIKOM Java Network": "STIKOM Java Network",
  "Publikasi dan dokumentasi, 2017": "Publication and documentation, 2017",
  "Palang Merah Remaja": "Red Cross Youth",
  "Anggota, 2013": "Member, 2013",
  "Bahasa": "Languages",
  "Indonesia": "Indonesian",
  "Penutur asli": "Native speaker",
  "Inggris": "English",
  "Pasif": "Passive",
  "Pencapaian": "Achievements",
  "Karya ilmiah: Aplikasi Presensi Karyawan Berbasis Android":
    "Thesis: An Android-Based Employee Attendance Application",
  "Universitas Dinamika, 2020 · terbit di repositori kampus":
    "Universitas Dinamika, 2020 · published in the campus repository",
  "Karya ilmiah: Sistem Penilaian Kinerja dengan Metode 360 Degree Feedback":
    "Thesis: A Performance Appraisal System Using 360 Degree Feedback",
  "Universitas Dinamika, 2020 · terindeks Neliti, 1 sitasi":
    "Universitas Dinamika, 2020 · indexed by Neliti, 1 citation",

  /* ------------------------------------------------------------ contact */
  "Ada yang perlu dibangun?": "Something to build?",
  "Kirim surel atau telepon langsung. Saya di Sidoarjo, terbuka untuk pekerjaan jarak jauh maupun di tempat.":
    "Send an email or call directly. I am in Sidoarjo, open to remote and on-site work.",
  "Salin alamat surel": "Copy email address",
  "Ramadhany Krismaliq Sjamdra · Sidoarjo, Jawa Timur":
    "Ramadhany Krismaliq Sjamdra · Sidoarjo, East Java",
  "Dibangun dengan Three.js · 2026": "Built with Three.js · 2026",

  /* -------------------------------------------------------------- panel */
  "Tutup panel": "Close panel",
  "Tutup": "Close",
  "Tangkapan layar": "Screenshot",
  "Kartu proyek": "Project card",
  "Resto 01": "Diner 01",
  "Tangkapan layar asli dari portofolio Ramadhany. Sistemnya dipakai internal, jadi tidak ada demo publik.":
    "An original screenshot from Ramadhany's portfolio. The system is used internally, so there is no public demo."
};

/* Resto 02..15 share the same pattern, so build those keys once. */
for (let i = 2; i <= 15; i += 1) {
  const n = String(i).padStart(2, "0");
  EN[`Resto ${n}`] = `Diner ${n}`;
}

const META = {
  id: {
    title: "Ramadhany Krismaliq Sjamdra · Fullstack Developer",
    description:
      "Portofolio Ramadhany Krismaliq Sjamdra, IT di instansi pemerintah dan fullstack developer Laravel. Lima belas proyek sebagai resto di satu jalan pesisir yang bisa disusuri dengan Three.js."
  },
  en: {
    title: "Ramadhany Krismaliq Sjamdra · Fullstack Developer",
    description:
      "Portfolio of Ramadhany Krismaliq Sjamdra, IT at a government agency and Laravel fullstack developer. Fifteen projects as diners along one coastal road you can drive through with Three.js."
  }
};

/* Strings the 3D module and the UI build at runtime. */
const RUNTIME = {
  "hud.end": {
    id: "Ujung jalan. Papan HUBUNGI SAYA ada di sisi kanan.",
    en: "End of the road. The GET IN TOUCH board is on the right."
  },
  "hud.distance": {
    id: "{m} m lagi, papan nama di sisi {side} jalan.",
    en: "{m} m to go, the sign is on the {side} side of the road."
  },
  "side.left": { id: "kiri", en: "left" },
  "side.right": { id: "kanan", en: "right" },
  "mood.0": { id: "Matahari terbenam", en: "Sun going down" },
  "mood.1": { id: "Biru malam", en: "Night blue" },
  "mood.2": { id: "Neon penuh", en: "Full neon" },
  "panel.kicker": { id: "Resto {n} / {total}", en: "Diner {n} / {total}" },
  "panel.figure.repo": { id: "Repo GitHub", en: "GitHub repo" },
  "panel.figure.shot": { id: "Tangkapan layar", en: "Screenshot" },
  "panel.figure.card": { id: "Kartu proyek", en: "Project card" },
  "panel.note.repo": {
    id: "Kartu repo dari GitHub. Kode, riwayat, dan README lengkapnya ada di repo publik.",
    en: "A repo card from GitHub. The code, history, and full README live in the public repo."
  },
  "panel.note.card": {
    id: "Kartu proyek. Aplikasinya berjalan lokal dan tidak ada tangkapan layar yang tersimpan.",
    en: "A project card. The app runs locally and no screenshot was kept."
  },
  "panel.note.internal": {
    id: "Tangkapan layar asli dari portofolio Ramadhany. Sistemnya dipakai internal, jadi tidak ada demo publik.",
    en: "An original screenshot from Ramadhany's portfolio. The system is used internally, so there is no public demo."
  },
  "explore.stop": { id: "Resto {n} · {name}", en: "Diner {n} · {name}" },
  "explore.map": {
    id: "Peta jalan · geser untuk menyusuri",
    en: "Road map · drag to travel"
  },
  "copy.done": { id: "Surel tersalin", en: "Email copied" },
  "copy.idle": { id: "Salin alamat surel", en: "Copy email address" },
  "start.fallback": { id: "Lihat daftar proyek", en: "View the project list" },
  "world.stop": { id: "RESTO {n}", en: "DINER {n}" },
  "world.gate": { id: "JALAN PESISIR", en: "COASTAL ROAD" },
  "world.gateSub": {
    id: "DANDHANY · FULLSTACK DEVELOPER",
    en: "DANDHANY · FULLSTACK DEVELOPER"
  },
  "world.end": { id: "HUBUNGI SAYA", en: "GET IN TOUCH" },
  "world.endSub": {
    id: "ADA PROYEK? KLIK PAPAN INI",
    en: "GOT A PROJECT? CLICK THIS BOARD"
  }
};

const STORAGE_KEY = "dandhany-lang";
const SUPPORTED = ["id", "en"];

function storedLang() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(saved)) return saved;
  } catch (error) {
    /* Private modes can refuse storage; Indonesian stays the default. */
  }
  return "id";
}

let current = storedLang();

/* ------------------------------------------------------------- collection */

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
const textRecords = [];
const attrRecords = [];
const ATTRS = ["alt", "aria-label", "title", "placeholder"];

function collectText() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    if (parent && !SKIP_TAGS.has(parent.tagName)) {
      const raw = node.nodeValue;
      const key = raw.trim();
      if (key && Object.prototype.hasOwnProperty.call(EN, key)) {
        const at = raw.indexOf(key);
        textRecords.push({
          node,
          key,
          translated: EN[key],
          lead: raw.slice(0, at),
          trail: raw.slice(at + key.length)
        });
      }
    }
    node = walker.nextNode();
  }
}

function collectAttrs() {
  document.querySelectorAll("[alt], [aria-label], [title], [placeholder]").forEach((el) => {
    ATTRS.forEach((attr) => {
      if (!el.hasAttribute(attr)) return;
      const value = el.getAttribute(attr);
      if (Object.prototype.hasOwnProperty.call(EN, value)) {
        attrRecords.push({ el, attr, key: value, translated: EN[value] });
      }
    });
  });
}

/* ------------------------------------------------------------------ render */

function interpolate(text, vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  );
}

function paint() {
  textRecords.forEach((record) => {
    record.node.nodeValue =
      record.lead + (current === "en" ? record.translated : record.key) + record.trail;
  });
  attrRecords.forEach((record) => {
    record.el.setAttribute(record.attr, current === "en" ? record.translated : record.key);
  });

  document.documentElement.lang = current;
  document.title = META[current].title;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", META[current].description);

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    const active = btn.dataset.lang === current;
    btn.setAttribute("aria-pressed", String(active));
    btn.classList.toggle("is-active", active);
  });
}

export function getLang() {
  return current;
}

export function t(key, vars) {
  const entry = RUNTIME[key];
  if (!entry) return key;
  return interpolate(entry[current] || entry.id, vars);
}

export function setLang(lang) {
  if (!SUPPORTED.includes(lang) || lang === current) return;
  current = lang;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch (error) {
    /* The page still switches; only the memory of the choice is lost. */
  }
  paint();
  document.dispatchEvent(new CustomEvent("portfolio:lang", { detail: { lang } }));
}

export function initI18n() {
  collectText();
  collectAttrs();
  paint();

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });

  document.dispatchEvent(new CustomEvent("portfolio:lang", { detail: { lang: current } }));
}

window.i18n = { getLang, t, setLang };

/* The module is deferred, so the markup is parsed by the time it runs. */
initI18n();
