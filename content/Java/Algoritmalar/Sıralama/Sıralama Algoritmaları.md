---
title: Sıralama Algoritmaları
tags:
  - java
  - algorithms
  - sorting
---

# Sıralama Algoritmaları

İki algoritma da solda sıralı bir bölüm oluşturur. Fark, bu bölümü **nasıl büyüttükleridir**.

| Algoritma | Temel fikir |
| --- | --- |
| [[Java/Algoritmalar/Sıralama/Selection Sort\|Selection Sort]] | Sağdaki bölümün minimumunu bul, başa al |
| [[Java/Algoritmalar/Sıralama/Insertion Sort\|Insertion Sort]] | Sıradaki elemanı soldaki sıralı bölüme yerleştir |

## Karşılaştırma

Aşağıdaki değerler, ilgili sayfalardaki standart uygulamalar içindir.

| Özellik | Selection Sort | Insertion Sort |
| --- | --- | --- |
| Best Case | Θ(n²) | Θ(n) |
| Average Case | Θ(n²) | Θ(n²) |
| Worst Case | Θ(n²) | Θ(n²) |
| Ek alan | O(1) | O(1) |
| In-place | Evet | Evet |
| Stabil | Hayır | Evet; karşılaştırma `>` ise |
| Zaten sıralı girdi | Minimum araması devam eder | Her turda tek eleman karşılaştırması yeter |

**In-place:** Girdi boyutuyla büyüyen ek bir array gerektirmez.

**Stabil:** Eşit anahtara sahip elemanların başlangıçtaki göreli sırası korunur.

## Ön bilgiler

- [[Java/Algoritmalar/Laufzeitanalyse/Big-O|Big-O]] — karmaşıklık gösterimi.
- [[Java/Algoritmalar/Laufzeitanalyse/Summenformel|Summenformel]] — karşılaştırmaları toplama.

[[Java/Algoritmalar/Algoritmalar|Algoritmalar]]

