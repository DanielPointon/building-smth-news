import json
database = open("database.json", "r")
data = json.load(database)
ft_articles = open("../scraper/out/ft_articles.json", "r")
ft_data = json.load(ft_articles)

for article in data['articles'].values():
    if not article.get("main_image_url"):
        title = article.get("title")
        for ft_article in ft_data:
            if ft_article and ft_article.get("title") == title:
                article["main_image_url"] = ft_article.get("main_image_url")
                break

with open("database2.json", "w") as f:
    f.write(json.dumps(data, indent=4))
    