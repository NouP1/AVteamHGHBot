const fetch = require('node-fetch');

exports.compressContent = async (text) => {
    const response = await fetch('http://127.0.0.1:5000/compress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${text}` })
    });

    const data = await response.json();
    console.log("Результат сжатия:", data.compressed_text);
    return data.compressed_text
};