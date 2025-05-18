from collections import defaultdict

# Historique des commandes (liste de listes)
orders = [
    ['baskets', 'chaussettes'],
    ['baskets'],
    ['chaussettes', 't-shirt'],
    ['baskets', 't-shirt'],
    ['chaussettes']
]

# 1. Compter la fréquence d'achat de chaque produit
product_counts = defaultdict(int)
# 2. Compter la fréquence d'achat conjointe (produit A + produit B)
pair_counts = defaultdict(lambda: defaultdict(int))

for order in orders:
    for product in order:
        product_counts[product] += 1
    # Comptage des paires dans la même commande
    for p1 in order:
        for p2 in order:
            if p1 != p2:
                pair_counts[p1][p2] += 1
                print(pair_counts[p1][p2])
# 3. Fonction pour recommander des produits à partir d'un produit donné
def recommend(product, top_n=2):
    recommendations = {}
    total_product = product_counts[product]
    if total_product == 0:
        return []
    for other_product, count in pair_counts[product].items():
        # Probabilité conditionnelle P(other_product | product)
        prob = count / total_product
        recommendations[other_product] = prob
    # Trier par probabilité décroissante
    sorted_recs = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
    return sorted_recs[:top_n]

# Exemple d'utilisation
produit_choisi = 'baskets'
print(f"Si un client achète '{produit_choisi}', on peut lui recommander :")
for prod, prob in recommend(produit_choisi):
    print(f"- {prod} avec une probabilité de {prob:.2f}")
