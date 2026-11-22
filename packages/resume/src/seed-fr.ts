import { b, i, li, link, p, plain, prose, t, ul } from "./seed-runs";
import type { Resume } from "./types";
import { CURRENT_SCHEMA_VERSION } from "./types";

/**
 * The French sample, the same résumé as `SEED_RESUME` in French. Dates and
 * levels keep the stored English form: the document's language turns the
 * dates into French when it renders, and the level menus list English values.
 */
export const SEED_RESUME_FR: Resume = {
  id: "seed",
  schemaVersion: CURRENT_SCHEMA_VERSION,
  title: "Untitled resume",
  templateId: "awal",
  language: "fr",
  showIcons: true,
  sectionSpacing: 0,
  letterSpacing: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  header: {
    fields: {
      firstName: plain("Camille"),
      lastName: plain("Martin"),
      jobTitle: plain("Ingénieure logiciel"),
      email: plain("camille.martin@example.com"),
      phone: plain("+33612345678"),
      website: plain("camillemartin.dev"),
      linkedin: plain("linkedin.com/in/camillemartin"),
      link: plain("github.com/camillemartin"),
      city: plain("Lyon"),
      province: plain("Rhône"),
      country: plain("France"),
    },
  },
  sections: [
    {
      id: "seed-summary",
      type: "summary",
      title: "Profil",
      entries: [
        {
          id: "seed-summary-1",
          fields: {
            body: prose(
              p(
                t("Ingénieure logiciel avec "),
                b("plus de 8 ans"),
                t(
                  " d'expérience dans la conception de services web et d'applications fiables pour la fintech et le SaaS. Solide maîtrise de ",
                ),
                b("TypeScript"),
                t(", "),
                b("Go"),
                t(" et PostgreSQL, avec un accent sur la "),
                i("fiabilité des systèmes"),
                t(
                  " et des résultats mesurables. À l'aise pour piloter des projets de bout en bout et accompagner des équipes.",
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
      title: "Expérience professionnelle",
      entries: [
        {
          id: "seed-experience-1",
          fields: {
            title: plain("Ingénieure logiciel senior"),
            company: plain("Acme Corp"),
            location: plain("Lyon, France"),
            companyContext: plain(
              "Plateforme de paiement B2B pour 2 millions de commerçants",
            ),
            website: plain("acme.example.com"),
            startDate: plain("Mar 2022"),
            endDate: plain("Present"),
            description: prose(
              ul(
                li(
                  t(
                    "Pilotage de la migration d'un monolithe de 200\u00a0000 lignes vers des services TypeScript plus petits, avec une baisse des incidents en production de ",
                  ),
                  b("40\u00a0%"),
                  t("."),
                ),
                li(
                  t(
                    "Conception d'un pipeline de rapprochement des paiements avec une précision de ",
                  ),
                  b("99,99\u00a0%"),
                  t(" sur chaque règlement."),
                ),
                li(
                  t("Réduction de la latence p95 de l'API de "),
                  b("55\u00a0%"),
                  t(
                    " grâce à l'optimisation des requêtes et au cache, de 480 ms à ",
                  ),
                  b("210 ms"),
                  t("."),
                ),
                li(
                  t(
                    "Développement d'un service d'événements en temps réel sur Kafka pour des tableaux de bord utilisés par ",
                  ),
                  b("12\u00a0000"),
                  t(" utilisateurs actifs par semaine."),
                ),
                li(
                  t("Maintenance de "),
                  link("pg-jobs", "https://github.com/camillemartin/pg-jobs"),
                  t(", une file de tâches open source pour PostgreSQL avec "),
                  b("plus de 2\u00a0000 étoiles"),
                  t("."),
                ),
                li(
                  t(
                    "Encadrement de quatre ingénieurs et définition des standards de revue de code, de tests et de mise en production de l'équipe.",
                  ),
                ),
              ),
            ),
          },
        },
        {
          id: "seed-experience-2",
          fields: {
            title: plain("Ingénieure logiciel"),
            company: plain("Globex"),
            location: plain("Télétravail"),
            companyContext: plain(""),
            website: plain("globex.example.com"),
            startDate: plain("Jul 2018"),
            endDate: plain("Feb 2022"),
            description: prose(
              ul(
                li(
                  t(
                    "Développement de l'API de reporting derrière les tableaux de bord analytiques clients, utilisés par ",
                  ),
                  b("12\u00a0000"),
                  t(" utilisateurs actifs par semaine."),
                ),
                li(
                  t(
                    "Mise en place de pipelines CI et de modèles de services partagés, avec des livraisons de fonctionnalités environ ",
                  ),
                  b("30\u00a0%"),
                  t(" plus rapides."),
                ),
                li(
                  t(
                    "Ajout de feature flags et de tests A/B (GrowthBook) pour déployer chaque changement de façon progressive et mesurable.",
                  ),
                ),
                li(
                  t("Disponibilité des services critiques portée à "),
                  b("99,95\u00a0%"),
                  t(
                    " grâce aux health checks, aux retries et aux runbooks d'astreinte.",
                  ),
                ),
              ),
            ),
          },
        },
        {
          id: "seed-experience-3",
          fields: {
            title: plain("Développeuse logiciel junior"),
            company: plain("Initech"),
            location: plain("Grenoble, France"),
            companyContext: plain(""),
            website: plain("initech.example.com"),
            startDate: plain("Aug 2016"),
            endDate: plain("Jun 2018"),
            description: prose(
              ul(
                li(
                  t(
                    "Développement d'outils internes et d'API REST en Node.js et PostgreSQL pour des clients grands comptes.",
                  ),
                ),
                li(
                  t(
                    "Automatisation des tests de non-régression, avec une réduction du temps de test manuel de ",
                  ),
                  b("20\u00a0%"),
                  t("."),
                ),
                li(
                  t(
                    "Publication d'une bibliothèque de validation de données toujours utilisée dans trois applications internes.",
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
      title: "Stages",
      entries: [
        {
          id: "seed-internship-1",
          fields: {
            title: plain("Stagiaire en ingénierie logicielle"),
            company: plain("Hooli"),
            location: plain("Toulouse, France"),
            companyContext: plain("Entreprise de produits tech grand public"),
            website: plain("hooli.example.com"),
            startDate: plain("Jun 2015"),
            endDate: plain("Aug 2015"),
            description: prose(
              ul(
                li(
                  t("Livraison d'une API de paramètres d'appareils en "),
                  b("Go"),
                  t(", utilisée par tous les bêta-testeurs à la fin du stage."),
                ),
                li(
                  t(
                    "Écriture des premiers tests d'intégration de l'équipe, avec une couverture du paquet d'API partagé portée à ",
                  ),
                  b("70\u00a0%"),
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
      title: "Projets",
      entries: [
        {
          id: "seed-projects-1",
          fields: {
            title: plain("pg-jobs"),
            company: plain("Créatrice et mainteneuse"),
            website: plain("github.com/camillemartin/pg-jobs"),
            startDate: plain("2020"),
            endDate: plain("Present"),
            description: prose(
              ul(
                li(
                  t(
                    "File de tâches open source pour Node.js sur PostgreSQL, avec ",
                  ),
                  b("plus de 2\u00a0000 étoiles"),
                  t(" et plus de 40 contributeurs."),
                ),
                li(
                  t(
                    "Utilisée en production par plusieurs équipes paiement et SaaS pour exécuter leurs tâches de fond.",
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
      title: "Engagement associatif",
      entries: [
        {
          id: "seed-organizations-1",
          fields: {
            role: plain("Organisatrice"),
            organization: plain("Lyon Backend Engineers Meetup"),
            startDate: plain("Jan 2021"),
            endDate: plain("Present"),
            description: prose(
              ul(
                li(
                  t(
                    "Organisation de rencontres mensuelles pour une communauté de ",
                  ),
                  b("1\u00a0800 membres"),
                  t(
                    ", avec la gestion des intervenants, des lieux et des sponsors.",
                  ),
                ),
                li(
                  t(
                    "Création d'une session de lightning talks qui a déjà offert une scène à plus de 30 nouveaux intervenants.",
                  ),
                ),
              ),
            ),
          },
        },
        {
          id: "seed-organizations-2",
          fields: {
            role: plain("Présidente"),
            organization: plain(
              "Club de développement web, Université Exemple",
            ),
            startDate: plain("2016"),
            endDate: plain("2018"),
            description: prose(
              ul(
                li(
                  t("Croissance du club de 30 à "),
                  b("120 membres"),
                  t(" et animation d'ateliers pratiques chaque semaine."),
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
      title: "Formation",
      entries: [
        {
          id: "seed-education-1",
          fields: {
            institution: plain("Université Exemple"),
            degree: plain("Licence en informatique"),
            location: plain("Grenoble, France"),
            startDate: plain("2014"),
            endDate: plain("2018"),
            details: prose(
              p(
                t(
                  "Diplômée avec mention très bien. Cours suivis : interaction homme-machine, systèmes distribués et algorithmique. Présidente du club de développement web du campus.",
                ),
              ),
            ),
          },
        },
        {
          id: "seed-education-2",
          fields: {
            institution: plain("Recurse Center"),
            degree: plain("Résidence en développement logiciel"),
            location: plain("New York, NY"),
            startDate: plain("2019"),
            endDate: plain("2019"),
            details: prose(
              p(
                t(
                  "Résidence en autonomie axée sur la programmation système, les compilateurs et la contribution open source.",
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
      title: "Certifications",
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
      title: "Compétences",
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
            name: plain("API GraphQL et REST"),
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
            name: plain("Tests (Playwright, Vitest)"),
            level: plain("Advanced"),
          },
        },
        {
          id: "seed-skills-8",
          fields: {
            name: plain("Kafka et event streaming"),
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
            name: plain("CI/CD et Docker"),
            level: plain("Intermediate"),
          },
        },
      ],
    },
    {
      id: "seed-languages",
      type: "languages",
      title: "Langues",
      columns: 2,
      showProficiency: true,
      entries: [
        {
          id: "seed-languages-1",
          fields: { name: plain("Français"), level: plain("Native") },
        },
        {
          id: "seed-languages-2",
          fields: { name: plain("Anglais"), level: plain("Professional") },
        },
        {
          id: "seed-languages-3",
          fields: { name: plain("Espagnol"), level: plain("Basic") },
        },
      ],
    },
  ],
};
