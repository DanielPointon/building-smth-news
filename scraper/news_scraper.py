import requests
from bs4 import BeautifulSoup

# from datetime import datetime
import logging
import json
import os


class FTScraper:
    def __init__(self):
        self.base_url = "https://www.ft.com"
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/91.0.4472.124 Safari/537.36"
            )
        }
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def get_articles(self, section=""):
        """
        Scrape headlines from FT's homepage or specified section
        Returns a list of dictionaries containing article information
        """
        try:
            url = f"{self.base_url}/{section}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")
            articles = []

            headlines = soup.find_all("a", {"data-trackable": "heading-link"})

            for headline in headlines:
                try:
                    title = headline.get_text().strip()
                    link = headline.get("href")
                    if link and not link.startswith("http"):
                        link = self.base_url + link

                    # Get timestamp if available (might be in a nearby element)
                    timestamp_elem = headline.find_parent().find_parent().find("time")
                    pub_date = (
                        timestamp_elem.get("datetime") if timestamp_elem else None
                    )

                    if title:
                        articles.append(
                            {
                                "title": title,
                                "url": link,
                                # "published_date": pub_date,
                                "source": "Financial Times",
                            }
                        )
                except Exception as e:
                    self.logger.error(f"Error parsing headline: {str(e)}")
                    continue

            self.logger.info(f"Found {len(articles)} articles")
            return articles

        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error fetching FT content: {str(e)}")
            return []

    def get_article_content(self, url):
        try:
            cookies = {
                "FTSession_s": (
                    "07UWyfoqUkLS053PUfVlHvcl0wAAAZHrq5hlw8I.MEQCID8uRj61TJAX6r"
                    "EYngYcbrTJknTgJ4reARviUd0xJCSLAiBLNJ7u3Po3iFh_-Nn1E20dUH4I2"
                    "22SFhzJnEfR5OzL4w"
                )
            }

            self.headers.update(
                {
                    "User-Agent": (
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                    )
                }
            )

            response = requests.get(url, headers=self.headers, cookies=cookies)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")

            # Find the JSON-LD script tag that contains the article content
            script_tag = soup.find("script", {"type": "application/ld+json"})
            if script_tag and "articleBody" in script_tag.string:

                article_data = json.loads(script_tag.string)

                article_info = {
                    "title": article_data.get("headline"),
                    "description": article_data.get("description"),
                    "author": article_data.get("author", [{}])[0].get("name"),
                    "published_date": article_data.get("datePublished"),
                    # 'modified_date': article_data.get('dateModified'),
                    "content": article_data.get("articleBody"),
                    # 'word_count': article_data.get('wordCount'),
                    "url": url,
                    "main_image_url": article_data.get("image", {}).get("url"),
                }
                # print(article_info)

                return article_info
            else:
                self.logger.error("Could not find article content. Might need auth.")
                return None

        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error fetching article content: {str(e)}")
            return None

    def get_article_content_with_img(self, url):
        try:
            cookies = {
                "FTSession_s": (
                    "07UWyfoqUkLS053PUfVlHvcl0wAAAZHrq5hlw8I.MEQCID8uRj61TJAX6r"
                    "EYngYcbrTJknTgJ4reARviUd0xJCSLAiBLNJ7u3Po3iFh_-Nn1E20dUH4I2"
                    "22SFhzJnEfR5OzL4w"
                )
            }

            self.headers.update(
                {
                    "User-Agent": (
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                    )
                }
            )

            response = requests.get(url, headers=self.headers, cookies=cookies)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")

            script_tag = soup.find("script", {"type": "application/ld+json"})
            metadata = {}
            if script_tag and "articleBody" in script_tag.string:
                article_data = json.loads(script_tag.string)
                metadata = {
                    "title": article_data.get("headline"),
                    "description": article_data.get("description"),
                    "author": article_data.get("author", [{}])[0].get("name") if article_data["author"] else "John Doe",
                    "published_date": article_data.get("datePublished"),
                    "main_image_url": article_data.get("image", {}).get("url"),
                }

            # Find the main article container
            article_container = soup.find("div", class_="article__content")
            content = []

            if article_container:
                article_body = article_container.find("article")

                target_container = article_body if article_body else article_container

                for child in target_container.find_all(["p", "img"]):
                    if child.name == "p" and not child.find_parent("figcaption"):
                        text = child.text.strip()
                        if text:  # Only add non-empty paragraphs
                            content.append({"type": "text", "content": text})
                    elif child.name == "img":
                        image_url = child.get("src")
                        if image_url:
                            # Get caption if available
                            caption = ""
                            figcaption = (
                                child.find_parent("figure").find("figcaption")
                                if child.find_parent("figure")
                                else None
                            )
                            if figcaption:
                                caption = figcaption.get_text().strip()

                            content.append(
                                {
                                    "type": "image",
                                    "image_url": image_url,
                                    "description": caption,
                                }
                            )
                return {**metadata, "content": content, "url": url}
            else:
                self.logger.error("Article container not found.")
                return None

        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error fetching article content: {str(e)}")
            return None


if __name__ == "__main__":
    scraper = FTScraper()

    sections_to_scrape = ["world", "world-uk", "companies", "technology", "markets", "climate-capital", "opinion", "lex"]
    # sections_to_scrape = ["world"]
    articles = [article for section in sections_to_scrape for article in scraper.get_articles(section)]

    # print(articles)

    article_contents = [
        scraper.get_article_content_with_img(article["url"]) for article in articles
    ]

    # article_contents = []
    # for i, article in enumerate(articles):
    #     content = scraper.get_article_content_with_img(article["url"])
    #     if content:  # Only append if content was successfully retrieved
    #         content["id"] = i
    #         article_contents.append(content)

    # print(article_contents)

    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")

    # Create the directory if it doesn't exist
    os.makedirs(out_dir, exist_ok=True)

    file_path = os.path.join(out_dir, "ft_articles.json")

    with open(file_path, "w") as f:
        json.dump(article_contents, f)

