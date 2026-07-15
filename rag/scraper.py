import requests
from bs4 import BeautifulSoup
import urllib.parse
import re

def scrape_jiit_site():
    print("Scraping JIIT core pages...")
    # These are key JIIT pages where useful info usually resides
    urls_to_scrape = [
        "https://www.jiit.ac.in/",
        "https://www.jiit.ac.in/programs",
        "https://www.jiit.ac.in/placement-overview",
        "https://www.jiit.ac.in/academic-overview",
        "https://www.jiit.ac.in/admissions-overview",
        "https://www.jiit.ac.in/research-overview",
    ]
    
    scraped_data = []
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    for url in urls_to_scrape:
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                
                # Remove scripts and styles
                for script in soup(["script", "style", "nav", "footer"]):
                    script.extract()
                
                text = soup.get_text(separator=' ')
                # Clean up whitespace
                text = re.sub(r'\s+', ' ', text).strip()
                
                if len(text) > 200:
                    scraped_data.append({
                        "source": "jiit",
                        "url": url,
                        "text": text
                    })
            else:
                print(f"Failed to scrape {url} - Status: {response.status_code}")
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            
    return scraped_data

if __name__ == "__main__":
    docs = scrape_jiit_site()
    print(f"Scraped {len(docs)} documents from JIIT.")
