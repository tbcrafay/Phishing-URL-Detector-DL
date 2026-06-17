from urllib.parse import urlparse
import re

class URLFeatureExtractor:
    known_safe_domains = {
        'paypal.com', 'www.paypal.com',
        'google.com', 'www.google.com',
        'gmail.com', 'www.gmail.com',
        'youtube.com', 'www.youtube.com',
        'youtu.be', 'gemini.google.com', # Added specific sub-nodes
        'facebook.com', 'www.facebook.com',
        'twitter.com', 'www.twitter.com',
        'linkedin.com', 'www.linkedin.com',
        'github.com', 'www.github.com',
        'amazon.com', 'www.amazon.com',
        'microsoft.com', 'www.microsoft.com',
        'apple.com', 'www.apple.com',
        'reddit.com', 'www.reddit.com',
        'wikipedia.org', 'www.wikipedia.org',
        'stackoverflow.com', 'www.stackoverflow.com',
    }
    
    # Refined regex patterns to avoid false matches on path strings
    phishing_patterns = [
        r'paypa[li]',
        r'goog[l1]e',
        r'micr[o0]s[o0]ft',
        r'amaz[o0]n',
        r'your[_-]?bank',
        r'verify[_-]?account',
        r'confirm[_-]?identity',
        r'update[_-]?payment'
    ]

    @staticmethod
    def extract_features(url: str):
        clean_url = url.lower().strip()
        parsed_url = urlparse(clean_url)
        hostname = parsed_url.hostname or ''
        
        # 1. Verify Whitelist Domain Database
        if hostname in URLFeatureExtractor.known_safe_domains:
            return {
                'confidence': 0.95,
                'is_phishing': False,
                'reason': f"Domain '{hostname}' verified in known safe domain database",
                'detection_type': 'domain_trust_database'
            }
            
        # 2. Check Phishing Anomaly Patterns ONLY on Hostname (Fixes Gemini issue)
        for pattern in URLFeatureExtractor.phishing_patterns:
            if re.search(pattern, hostname):
                return {
                    'confidence': 0.98,
                    'is_phishing': True,
                    'reason': f"High-confidence phishing pattern detected in domain structure: '{pattern}'",
                    'detection_type': 'phishing_pattern_recognition'
                }
                
        # 3. Default state structural analysis routing
        return {
            'confidence': None,
            'is_phishing': None,
            'reason': 'Ambiguous features - routing to deep learning engine grid models',
            'detection_type': 'requires_dl_analysis'
        }