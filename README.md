# POS / Caisse - Gestion de Vente & Stock

Application de caisse moderne développée en Full Stack avec Angular et NestJS.

## 🚀 Stack Technique

### Frontend
- Angular 20+
- TypeScript
- Bootstrap 5
- RxJS
- JWT Auth
- Angular SSR

### Backend
- NestJS
- TypeORM
- MySQL
- JWT
- REST API

---

## ✨ Fonctionnalités

### 🔐 Authentification
- Connexion sécurisée JWT
- Gestion des rôles
- Protection des routes

### 🛒 Point de Vente (POS)
- Ajout rapide des produits
- Recherche instantanée
- Panier dynamique
- Calcul automatique des totaux
- Gestion des paiements :
  - Espèces
  - MVola
  - Carte bancaire
- Impression ticket
- Référence de paiement

### 📦 Gestion de Stock
- Articles
- Fiches Techniques (FT)
- Inventaires
- Transferts
- Alertes stock faible

### 🧾 Ventes
- Historique des ventes
- Tickets
- Calcul marge & coût matière
- Dashboard statistiques

### 👥 Gestion utilisateurs
- ADMIN
- RESPONSABLE_CAISSE
- CAISSIER

---

## 📊 Dashboard
- Ventes du jour
- Chiffre d'affaires
- Produits les plus vendus
- Graphiques statistiques
- Historique des transactions

---

## 🏗️ Architecture

```txt
frontend/
 ├── auth/
 ├── dashboard/
 ├── caisse/
 ├── ventes/
 ├── stock/
 └── shared/

backend/
 ├── auth/
 ├── ventes/
 ├── caisse/
 ├── stock/
 ├── dashboard/
 └── common/
