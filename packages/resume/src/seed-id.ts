import { b, i, li, link, p, plain, prose, t, ul } from "./seed-runs";
import type { Resume } from "./types";
import { CURRENT_SCHEMA_VERSION } from "./types";

/**
 * The Indonesian sample, the same résumé as `SEED_RESUME` in Indonesian. Dates
 * and levels keep the stored English form: the document's language turns the
 * dates into Indonesian when it renders, and the level menus list English
 * values.
 */
export const SEED_RESUME_ID: Resume = {
  id: "seed",
  schemaVersion: CURRENT_SCHEMA_VERSION,
  title: "Untitled resume",
  templateId: "awal",
  language: "id",
  showIcons: true,
  sectionSpacing: 0,
  letterSpacing: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  header: {
    fields: {
      firstName: plain("Budi"),
      lastName: plain("Santoso"),
      jobTitle: plain("Software Engineer"),
      email: plain("budi.santoso@example.com"),
      phone: plain("+6281200001234"),
      website: plain("budisantoso.dev"),
      linkedin: plain("linkedin.com/in/budisantoso"),
      link: plain("github.com/budisantoso"),
      city: plain("Jakarta"),
      province: plain("DKI Jakarta"),
      country: plain("Indonesia"),
    },
  },
  sections: [
    {
      id: "seed-summary",
      type: "summary",
      title: "Ringkasan",
      entries: [
        {
          id: "seed-summary-1",
          fields: {
            body: prose(
              p(
                t("Software engineer dengan pengalaman "),
                b("8+ tahun"),
                t(
                  " membangun layanan web dan aplikasi yang andal untuk fintech dan SaaS. Menguasai ",
                ),
                b("TypeScript"),
                t(", "),
                b("Go"),
                t(", dan PostgreSQL, dengan fokus pada "),
                i("keandalan sistem"),
                t(
                  " dan hasil yang terukur. Terbiasa memimpin proyek dari awal sampai akhir dan membimbing tim.",
                ),
              ),
            ),
          },
        },
      ],
    },
    {
      id: "seed-experience",
      type: "experience",
      title: "Pengalaman",
      entries: [
        {
          id: "seed-experience-1",
          fields: {
            title: plain("Senior Software Engineer"),
            company: plain("Acme Corp"),
            location: plain("Jakarta, Indonesia"),
            companyContext: plain(
              "Platform pembayaran B2B untuk 2 juta merchant",
            ),
            website: plain("acme.example.com"),
            startDate: plain("Mar 2022"),
            endDate: plain("Present"),
            description: prose(
              ul(
                li(
                  t(
                    "Memimpin migrasi monolit 200 ribu baris ke layanan-layanan TypeScript yang lebih kecil, menurunkan insiden produksi sebesar ",
                  ),
                  b("40%"),
                  t("."),
                ),
                li(
                  t(
                    "Merancang pipeline rekonsiliasi pembayaran dengan akurasi ",
                  ),
                  b("99,99%"),
                  t(" di setiap proses settlement."),
                ),
                li(
                  t("Memangkas latensi API p95 sebesar "),
                  b("55%"),
                  t(" lewat query tuning dan caching, dari 480 ms menjadi "),
                  b("210 ms"),
                  t("."),
                ),
                li(
                  t(
                    "Membangun layanan event real-time di Kafka untuk dashboard yang dipakai ",
                  ),
                  b("12 ribu"),
                  t(" pengguna aktif mingguan."),
                ),
                li(
                  t("Mengelola "),
                  link("pg-jobs", "https://github.com/budisantoso/pg-jobs"),
                  t(", job queue open source untuk PostgreSQL dengan "),
                  b("2 ribu+ bintang"),
                  t("."),
                ),
                li(
                  t(
                    "Membimbing empat engineer dan menetapkan standar code review, pengujian, dan rilis tim.",
                  ),
                ),
              ),
            ),
          },
        },
        {
          id: "seed-experience-2",
          fields: {
            title: plain("Software Engineer"),
            company: plain("Globex"),
            location: plain("Remote"),
            companyContext: plain(""),
            website: plain("globex.example.com"),
            startDate: plain("Jul 2018"),
            endDate: plain("Feb 2022"),
            description: prose(
              ul(
                li(
                  t(
                    "Membangun API pelaporan di balik dashboard analitik pelanggan, dipakai ",
                  ),
                  b("12 ribu"),
                  t(" pengguna aktif mingguan."),
                ),
                li(
                  t(
                    "Memperkenalkan pipeline CI dan template layanan bersama, mempercepat pengiriman fitur sekitar ",
                  ),
                  b("30%"),
                  t("."),
                ),
                li(
                  t(
                    "Menambahkan feature flag dan A/B testing (GrowthBook) agar setiap perubahan rilis secara bertahap dan terukur.",
                  ),
                ),
                li(
                  t("Menaikkan uptime layanan inti menjadi "),
                  b("99,95%"),
                  t(" dengan health check, retry, dan runbook on-call."),
                ),
              ),
            ),
          },
        },
        {
          id: "seed-experience-3",
          fields: {
            title: plain("Junior Software Developer"),
            company: plain("Initech"),
            location: plain("Bandung, Indonesia"),
            companyContext: plain(""),
            website: plain("initech.example.com"),
            startDate: plain("Aug 2016"),
            endDate: plain("Jun 2018"),
            description: prose(
              ul(
                li(
                  t(
                    "Membangun alat internal dan REST API dengan Node.js dan PostgreSQL untuk klien enterprise.",
                  ),
                ),
                li(
                  t(
                    "Mengotomatiskan regression test, mengurangi waktu pengujian manual sebesar ",
                  ),
                  b("20%"),
                  t("."),
                ),
                li(
                  t(
                    "Merilis library validasi data yang masih dipakai di tiga aplikasi internal.",
                  ),
                ),
              ),
            ),
          },
        },
      ],
    },
    {
      id: "seed-internship",
      type: "internship",
      title: "Magang",
      entries: [
        {
          id: "seed-internship-1",
          fields: {
            title: plain("Software Engineering Intern"),
            company: plain("Hooli"),
            location: plain("Yogyakarta, Indonesia"),
            companyContext: plain("Perusahaan teknologi produk konsumen"),
            website: plain("hooli.example.com"),
            startDate: plain("Jun 2015"),
            endDate: plain("Aug 2015"),
            description: prose(
              ul(
                li(
                  t("Merilis API pengaturan perangkat dengan "),
                  b("Go"),
                  t(", dipakai seluruh peserta beta di akhir masa magang."),
                ),
                li(
                  t(
                    "Menulis integration test pertama tim, menaikkan coverage paket API bersama menjadi ",
                  ),
                  b("70%"),
                  t("."),
                ),
              ),
            ),
          },
        },
      ],
    },
    {
      id: "seed-projects",
      type: "projects",
      title: "Proyek",
      entries: [
        {
          id: "seed-projects-1",
          fields: {
            title: plain("pg-jobs"),
            company: plain("Pembuat dan maintainer"),
            website: plain("github.com/budisantoso/pg-jobs"),
            startDate: plain("2020"),
            endDate: plain("Present"),
            description: prose(
              ul(
                li(
                  t(
                    "Job queue open source untuk Node.js di PostgreSQL dengan ",
                  ),
                  b("2 ribu+ bintang"),
                  t(" dan 40+ kontributor."),
                ),
                li(
                  t(
                    "Dipakai untuk menjalankan background job di produksi oleh beberapa tim pembayaran dan SaaS.",
                  ),
                ),
              ),
            ),
          },
        },
      ],
    },
    {
      id: "seed-organizations",
      type: "organizations",
      title: "Organisasi",
      entries: [
        {
          id: "seed-organizations-1",
          fields: {
            role: plain("Penyelenggara"),
            organization: plain("Jakarta Backend Engineers Meetup"),
            startDate: plain("Jan 2021"),
            endDate: plain("Present"),
            description: prose(
              ul(
                li(
                  t("Menyusun sesi bulanan untuk komunitas "),
                  b("1.800 anggota"),
                  t(" serta mengatur pembicara, tempat, dan sponsor."),
                ),
                li(
                  t(
                    "Memulai sesi lightning talk yang sudah memberi panggung bagi 30+ pembicara pemula.",
                  ),
                ),
              ),
            ),
          },
        },
        {
          id: "seed-organizations-2",
          fields: {
            role: plain("Ketua"),
            organization: plain("Klub Pengembangan Web, Universitas Contoh"),
            startDate: plain("2016"),
            endDate: plain("2018"),
            description: prose(
              ul(
                li(
                  t("Mengembangkan klub dari 30 menjadi "),
                  b("120 anggota"),
                  t(" dan mengadakan workshop praktik setiap minggu."),
                ),
              ),
            ),
          },
        },
      ],
    },
    {
      id: "seed-education",
      type: "education",
      title: "Pendidikan",
      entries: [
        {
          id: "seed-education-1",
          fields: {
            institution: plain("Universitas Contoh"),
            degree: plain("S1 Teknik Informatika"),
            location: plain("Bandung, Indonesia"),
            startDate: plain("2014"),
            endDate: plain("2018"),
            details: prose(
              p(
                t(
                  "Lulus cum laude (IPK 3,80). Mata kuliah yang diambil: interaksi manusia dan komputer, sistem terdistribusi, dan algoritma. Ketua Klub Pengembangan Web kampus.",
                ),
              ),
            ),
          },
        },
        {
          id: "seed-education-2",
          fields: {
            institution: plain("Recurse Center"),
            degree: plain("Program Residensi Software"),
            location: plain("New York, NY"),
            startDate: plain("2019"),
            endDate: plain("2019"),
            details: prose(
              p(
                t(
                  "Residensi mandiri dengan fokus pada pemrograman sistem, compiler, dan kontribusi open source.",
                ),
              ),
            ),
          },
        },
      ],
    },
    {
      id: "seed-certifications",
      type: "certifications",
      title: "Sertifikat",
      entries: [
        {
          id: "seed-certifications-1",
          fields: {
            name: plain("AWS Certified Solutions Architect – Associate"),
            issuer: plain("Amazon Web Services"),
            url: plain("aws.amazon.com/verification"),
          },
        },
        {
          id: "seed-certifications-2",
          fields: {
            name: plain("Certified Kubernetes Application Developer (CKAD)"),
            issuer: plain("The Linux Foundation"),
            url: plain("training.linuxfoundation.org/certification/verify"),
          },
        },
        {
          id: "seed-certifications-3",
          fields: {
            name: plain("HashiCorp Certified: Terraform Associate"),
            issuer: plain("HashiCorp"),
            url: plain("hashicorp.com/certification"),
          },
        },
      ],
    },
    {
      id: "seed-skills",
      type: "skills",
      title: "Keahlian",
      columns: 2,
      showProficiency: true,
      entries: [
        {
          id: "seed-skills-1",
          fields: { name: plain("TypeScript"), level: plain("Expert") },
        },
        {
          id: "seed-skills-2",
          fields: { name: plain("Go"), level: plain("Expert") },
        },
        {
          id: "seed-skills-3",
          fields: { name: plain("PostgreSQL"), level: plain("Expert") },
        },
        {
          id: "seed-skills-4",
          fields: { name: plain("Node.js"), level: plain("Advanced") },
        },
        {
          id: "seed-skills-5",
          fields: {
            name: plain("GraphQL & REST API"),
            level: plain("Advanced"),
          },
        },
        {
          id: "seed-skills-6",
          fields: { name: plain("React"), level: plain("Advanced") },
        },
        {
          id: "seed-skills-7",
          fields: {
            name: plain("Pengujian (Playwright, Vitest)"),
            level: plain("Advanced"),
          },
        },
        {
          id: "seed-skills-8",
          fields: {
            name: plain("Kafka & event streaming"),
            level: plain("Advanced"),
          },
        },
        {
          id: "seed-skills-9",
          fields: {
            name: plain("AWS (ECS, RDS, S3)"),
            level: plain("Advanced"),
          },
        },
        {
          id: "seed-skills-10",
          fields: {
            name: plain("CI/CD & Docker"),
            level: plain("Intermediate"),
          },
        },
      ],
    },
    {
      id: "seed-languages",
      type: "languages",
      title: "Bahasa",
      columns: 2,
      showProficiency: true,
      entries: [
        {
          id: "seed-languages-1",
          fields: { name: plain("Bahasa Indonesia"), level: plain("Native") },
        },
        {
          id: "seed-languages-2",
          fields: {
            name: plain("Bahasa Inggris"),
            level: plain("Professional"),
          },
        },
        {
          id: "seed-languages-3",
          fields: { name: plain("Bahasa Jepang"), level: plain("Basic") },
        },
      ],
    },
  ],
};
