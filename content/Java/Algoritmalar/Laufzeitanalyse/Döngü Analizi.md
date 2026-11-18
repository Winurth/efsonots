---
title: Döngü Analizi
tags:
  - java
  - algorithms
  - complexity
---

# Döngü Analizi

Amaç: Döngü gövdesinin kaç kez çalıştığını bulup [[Java/Algoritmalar/Laufzeitanalyse/Big-O|Big-O]] ile büyümesini ifade etmek.

## O(1) — Sabit işlem

```java
int x = arr[0];
```

Array uzunluğundan bağımsız olarak tek erişim yapılır.

## O(n) — Lineer döngü

```java
for (int i = 0; i < n; i++) {
    System.out.println(i);
}
```

Gövde `n` kez çalışır.

## O(log n) — İkiye katlama

```java
for (long i = 1; i < n; i *= 2) {
    System.out.println(i);
}
```

`n = 16` için gövde `i = 1, 2, 4, 8` değerlerinde çalışır: **4 tekrar**.

`n ≥ 1` için tekrar sayısı:

$$
T(n)=\lceil\log_2 n\rceil
$$

Bu örneklerde `n` negatif olmayan bir `int` kabul edilir; katlanan sayaç taşmayı önlemek için `long` tutulur.

## Arka arkaya döngüler → Topla

```java
for (int i = 0; i < n; i++) { }
for (long j = 1; j < n; j *= 2) { }
```

$$
O(n+\log n)=O(n)
$$
n > log n olduğu için, O(n)
## Bağımsız iç içe döngüler → Çarp

```java
for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
        System.out.println("Hello");
    }
}
```

Gövde $n\cdot n=n^2$ kez çalışır → **O(n²)**.

```java
for (int i = 0; i < n; i++) {
    for (long j = 1; j < n; j *= 2) {
        System.out.println("Hello");
    }
}
```

Gövde $n\lceil\log_2 n\rceil$ kez çalışır (`n ≥ 1`) → **O(n log n)**.

## İç sınır dış değişkene bağlıysa → Toplam kur

`j < i` gibi bir sınır varsa iç döngü her dış turda farklı sayıda çalışır. Hesabı: [[Java/Algoritmalar/Laufzeitanalyse/Summenformel|Summenformel]].

> [!tip] Klausur-Regel
> Arka arkaya → topla. Bağımsız iç içe → çarp. Bağımlı sınırlar → toplam kur.
> **İç içe döngüler her zaman O(n²) değildir.**

[[Java/Algoritmalar/Algoritmalar|Algoritmalar]]

