# Edify Documents Checklist

Web-based Documents Checklist form for Edify Group of Companies.

## Features

- Fill out document checklist with checkboxes
- Enter Country and Remarks
- **Download PDF** – saves filled form as PDF
- **Share on WhatsApp** – shares summary + PDF (on mobile) or opens WhatsApp with summary
- **Share via Email** – opens email with summary (attach downloaded PDF on desktop)

## How to Run

Open `index.html` in a browser, or serve locally:

```bash
# Python 3
python3 -m http.server 8080

# Then visit http://localhost:8080
```

## Notes

- Country field and at least one checkbox must be filled before export
- On mobile devices, the Web Share API can attach the PDF directly
- On desktop, PDF is downloaded and you attach it manually in WhatsApp/Email
