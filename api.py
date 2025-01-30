from flask import Flask, request, jsonify
import spacy

# Загрузка модели SpaCy
nlp = spacy.load("ru_core_news_lg")  # Русская модель для обработки текста

app = Flask(__name__)

@app.route('/compress', methods=['POST'])
def compress_text():
    try:
        # Получаем текст из POST-запроса
        data = request.json
        text = data.get('text', '')

        if not text:
            return jsonify({"error": "Поле 'text' не должно быть пустым"}), 400

        # Обработка текста
        doc = nlp(text)
        summary = []
        for sent in doc.sents:
            # Выбираем предложения с существительными и глаголами
            if any(token.pos_ in ("NOUN", "VERB") for token in sent):
                summary.append(sent.text)

        # Берем только первое предложение
        condensed = " ".join(summary[:1])
        if not condensed.strip():
            condensed = "Описание темы."

        # Возвращаем результат
        print(condensed)
        return jsonify({"compressed_text": condensed}), 200


    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)