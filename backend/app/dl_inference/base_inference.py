import os
import tensorflow as tf

class BaseInference:
    def _apply_compatibility_patch(self):
        try:
            from tensorflow.keras import layers as _layers
            def _wrap_ignore_quant(cls):
                orig_init = cls.__init__
                def __init__(self, *a, **kw):
                    kw.pop("quantization_config", None)
                    return orig_init(self, *a, **kw)
                cls.__init__ = __init__

            for _name in ("Embedding", "Dense", "Conv1D", "Dropout", "GlobalAveragePooling1D", "Bidirectional", "LSTM"):
                _cls = getattr(_layers, _name, None)
                if _cls is not None: _wrap_ignore_quant(_cls)
            print("🚀 [DL Inference] Compatibility patch applied.")
        except Exception as e:
            print(f"⚠️ Patch failed: {e}")

    def load_model(self, model_path):
        try:
            return tf.keras.models.load_model(model_path)
        except Exception:
            self._apply_compatibility_patch()
            return tf.keras.models.load_model(model_path)