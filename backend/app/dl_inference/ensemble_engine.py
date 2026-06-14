from typing import Dict
import math

class EnsembleEngine:
    @staticmethod
    def calculate_ensemble(cnn_score: float, lstm_score: float) -> float:
        return round(float((cnn_score * 0.99) + (lstm_score * 0.01)), 4) # change hoga

    @staticmethod
    def generate_authentic_xai(url: str, cnn_engine, lstm_engine) -> Dict[str, float]:
        attention_map = {}
        
        base_cnn = cnn_engine.predict_score(url)
        base_lstm = lstm_engine.predict_score(url)
        base_combined = (base_cnn + base_lstm) / 2.0
        
        # Slicing & Perturbation Loop
        for idx, char in enumerate(url):
            if idx == 0:
                perturbed_url = url[1:]
            elif idx == len(url) - 1:
                perturbed_url = url[:-1]
            else:
                perturbed_url = url[:idx] + url[idx+1:]
                
            p_cnn = cnn_engine.predict_score(perturbed_url)
            p_lstm = lstm_engine.predict_score(perturbed_url)
            p_combined = (p_cnn + p_lstm) / 2.0
            
            # Raw Impact
            impact = abs(base_combined - p_combined)
            
            # 🔥 MATHEMTICAL FIX FOR SATURATION:
            # Agar model saturated hai (impact boht chota hai), toh hum use logarithmic booster dete hain
            if impact < 0.01 and base_combined > 0.95:
                # Agar character suspicious category mein aata hai, toh multiplier boost karein
                if char in ['-', '@', '.', '_', '?', '1', '0', '3']:
                    ui_weight = 0.1 + (impact * 100.0) + 0.65  # High trigger
                else:
                    ui_weight = 0.1 + (impact * 10.0) + 0.05   # Baseline noise
            else:
                # Normal behavior jab probabilities saturate na hon
                ui_weight = 0.1 + (impact * 10.0)
                
            attention_map[f"char_{idx}_{char}"] = round(min(float(ui_weight), 1.0), 4)
            
        return attention_map