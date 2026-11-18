---
title: Summenformel
tags:
  - java
  - algorithms
  - complexity
---

# Summenformel

İç döngünün sınırı dış değişkene bağlıysa her turun tekrar sayısını toplarız. Burada `T(n)`, **iç döngü gövdesinin çalışma sayısıdır**.

## Durum A — `j < i`

```java
for (int i = 0; i < n; i++) {
    for (int j = 0; j < i; j++) { }
}
```

`i = 0` için 0, `i = 1` için 1, son tur için `n−1` tekrar:

$$
T(n)=0+1+\dots+(n-1)=\boxed{\frac{n(n-1)}{2}}
$$

## Durum B — `j <= i`

```java
for (int i = 0; i < n; i++) {
    for (int j = 0; j <= i; j++) { }
}
```

`i = 0` için 1, `i = 1` için 2, son tur için `n` tekrar:

$$
T(n)=1+2+\dots+n=\boxed{\frac{n(n+1)}{2}}
$$

## Küçük örnek: `n = 4`

| Dış tur `i` | `j < i` | `j <= i` |
| --- | --- | --- |
| 0 | 0 | 1 |
| 1 | 1 | 2 |
| 2 | 2 | 3 |
| 3 | 3 | 4 |
| **Toplam** | **6** | **10** |

Her iki toplamın da baskın terimi `n²`'dir → **Θ(n²)**. Sadeleştirme: [[Java/Algoritmalar/Laufzeitanalyse/Big-O|Big-O]].

[[Java/Algoritmalar/Sıralama/Selection Sort|Selection Sort]] da $(n-1)+(n-2)+\dots+1$ karşılaştırma yapar; aynı formül kullanılır.

[[Java/Algoritmalar/Laufzeitanalyse/Döngü Analizi|Döngü Analizi]] · [[Java/Algoritmalar/Algoritmalar|Algoritmalar]]

