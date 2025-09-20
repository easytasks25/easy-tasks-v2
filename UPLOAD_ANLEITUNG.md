# 📤 Projekt zu GitHub hochladen

## Schnelle Lösung für das Build-Problem

Das Problem war, dass das Seed-Script ein `organization`-Feld benötigt. Ich habe das behoben:

### ✅ Was ich geändert habe:
1. **`package.json`**: Seed-Script auf einfache Version umgestellt
2. **`prisma/seed-simple.ts`**: Neue, funktionierende Version erstellt
3. **`prisma/seed.ts`**: Ursprüngliche Version mit Organisationen (für später)

### 🚀 Jetzt hochladen:

#### **Option 1: GitHub Desktop (empfohlen)**
1. **Öffnen Sie GitHub Desktop**
2. **Klicken Sie auf "Changes"** (sollte 3 geänderte Dateien zeigen)
3. **Commit-Nachricht**: "Fix build: Simplify seed script for production"
4. **Klicken Sie auf "Commit to main"**
5. **Klicken Sie auf "Push origin"**

#### **Option 2: GitHub Website**
1. **Gehen Sie zu [github.com/easytasks25/lwtasks](https://github.com/easytasks25/lwtasks)**
2. **Klicken Sie auf "uploading an existing file"**
3. **Ziehen Sie den gesamten Ordner `c:\lwtasks` in den Browser**
4. **Klicken Sie auf "Commit changes"**

#### **Option 3: VS Code**
1. **Öffnen Sie VS Code**
2. **Öffnen Sie den Ordner `c:\lwtasks`**
3. **Klicken Sie auf das Git-Symbol links**
4. **Commit-Nachricht eingeben und "Commit" klicken**
5. **"Push" klicken**

### 🔄 Nach dem Upload:
1. **Gehen Sie zu Vercel**
2. **Warten Sie 1-2 Minuten** (automatisches Redeploy)
3. **Oder klicken Sie auf "Redeploy"**

### ✅ Das sollte jetzt funktionieren!
Die App wird ohne Seed-Script-Fehler builden und deployen.
