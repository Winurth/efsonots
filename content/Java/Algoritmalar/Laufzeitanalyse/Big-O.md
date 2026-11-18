---
title: Big-O
tags:
  - java
  - algorithms
  - complexity
---

# Big-O

Big-O, girdi büyüklüğü `n` arttıkça işlem maliyetinin nasıl büyüdüğünü ifade eden **asimptotik üst sınırdır**.

## Temel sınıflar

| Big-O | Almancası | Örnek |
| --- | --- | --- |
| O(1) | Konstant | `arr[0]` ile erişim |
| O(log n) | Logarithmisch | Sayaç her turda ikiye katlanır |
| O(n) | Linear | `n` elemanı bir kez gezmek |
| O(n log n) | Linearithmisch | `n` tur boyunca logaritmik bir döngü |
| O(n²) | Quadratisch | `n` tur boyunca `n` elemanı gezmek |

Sabit maliyetli bir işlem gövdesi varsayılır. Kod örnekleri: [[Java/Algoritmalar/Laufzeitanalyse/Döngü Analizi|Döngü Analizi]].

## Sadeleştirme

Baskın terimi tutarız; sabit çarpanları ve daha yavaş büyüyen terimleri atarız.

$$
T(n)=\frac{n(n-1)}{2}+3n
=\frac{n^2+5n}{2}
$$

Dolayısıyla $T(n)\in O(n^2)$. Burada sıkı sınır da $\Theta(n^2)$'dir.

## `T(n)`, `O` ve `Θ`

| Gösterim | Anlamı |
| --- | --- |
| `T(n)` | Seçilen maliyet modeline göre işlem sayısı veya maliyet fonksiyonu |
| `O(...)` | Asimptotik üst sınır |
| `Θ(...)` | Asimptotik sıkı sınır; hem üst hem alt sınır |

> [!warning] İşlem sayısı ve karmaşıklık farklıdır
> Örneğin [[Java/Algoritmalar/Sıralama/Selection Sort|Selection Sort]] 8 elemanda **28 eleman karşılaştırması** yapar. Karşılaştırma sayısının büyümesi ise Θ(n²)'dir.

## Bağlantılar

- [[Java/Algoritmalar/Laufzeitanalyse/Summenformel|Summenformel]] — toplamları hesaplama.
- [[Java/Algoritmalar/Laufzeitanalyse/Amortisierte Laufzeit|Amortisierte Laufzeit]] — işlem dizileri üzerinden analiz.
- [[Java/Algoritmalar/Algoritmalar|Algoritmalar]] — konu haritası.

