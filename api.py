from flask import Flask, request, jsonify
import spacy

# Загружаем модель spaCy
nlp = spacy.load("ru_core_news_sm")

app = Flask(__name__)

@app.route('/compress', methods=['POST'])
def compress_text():
    try:
        data = request.json
        text = data.get('text', '').strip()

        if not text:
            return jsonify({"error": "Поле 'text' не должно быть пустым"}), 400

        # Анализируем текст с помощью spaCy
        doc = nlp(text)

        # Выбираем только значимые слова (исключая стоп-слова, знаки препинания и цифры)
        main_words = [token.text for token in doc if token.is_alpha and not token.is_stop]

        # Если текст слишком короткий, оставляем как есть
        if len(main_words) == 0:
            compressed_text = text
        else:
            compressed_text = " ".join(main_words[:6])  # Берем первые 6 значимых слов
        
        return jsonify({"compressed_text": compressed_text}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)