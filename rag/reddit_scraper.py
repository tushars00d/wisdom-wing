import requests

def scrape_reddit_jiit():
    print("Scraping Reddit r/JIIT__NOIDA...")
    url = "https://www.reddit.com/r/JIIT__NOIDA/new.json?limit=50"
    
    scraped_data = []
    headers = {
        "User-Agent": "WisdomWingBot/1.0"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            posts = data.get("data", {}).get("children", [])
            
            for post in posts:
                post_data = post.get("data", {})
                title = post_data.get("title", "")
                selftext = post_data.get("selftext", "")
                permalink = post_data.get("permalink", "")
                ups = post_data.get("ups", 0)
                
                text_content = f"{title}. {selftext}".strip()
                if len(text_content) >= 150 and ups >= 5:
                    scraped_data.append({
                        "source": "reddit",
                        "url": f"https://www.reddit.com{permalink}",
                        "text": text_content
                    })
        else:
            print(f"Reddit scrape failed - Status: {response.status_code}")
    except Exception as e:
        print(f"Error scraping Reddit: {e}")
        
    return scraped_data

if __name__ == "__main__":
    docs = scrape_reddit_jiit()
    print(f"Scraped {len(docs)} posts from Reddit.")
