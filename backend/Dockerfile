FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para pymysql o herramientas
RUN apt-get update && apt-get install -y pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copiar dependencias e instalarlas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY . .

# Variables de entorno por defecto para desarrollo
ENV FLASK_APP=src/app.py
ENV FLASK_DEBUG=1
ENV FLASK_ENV=development
ENV PYTHONPATH=/app/src

EXPOSE 5000

# Comando para ejecutar la aplicación en modo desarrollo
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
