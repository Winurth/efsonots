---
title: Selection Sort
tags:
  - java
  - algorithms
  - sorting
---

# Selection Sort

Her turda sıralanmamış bölümün **en küçük elemanını bulur** ve bu bölümün ilk elemanıyla yer değiştirir (*swap*).

## Adım adım

| Tur | Array | İşlem |
| --- | --- | --- |
| Başlangıç | `[7, 5, 9, 2, 3]` | Soldaki sıralı bölüm boş |
| 1 | `[2, 5, 9, 7, 3]` | 7 ↔ 2 |
| 2 | `[2, 3, 9, 7, 5]` | 5 ↔ 3 |
| 3 | `[2, 3, 5, 7, 9]` | 9 ↔ 5 |
| 4 | `[2, 3, 5, 7, 9]` | 7 zaten yerinde |

Her turdan sonra soldaki sıralı bölüm bir eleman büyür.

## Java kodu

```java
public static void selectionSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        int minIndex = i;

        for (int j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }

        int temp = arr[i];
        arr[i] = arr[minIndex];
        arr[minIndex] = temp;
    }
}
```

## Değişkenler ne yapıyor?

| Değişken | Görevi |
| --- | --- |
| `i` | Bu turda doldurulacak konum |
| `minIndex` | Şimdiye kadar bulunan minimumun index'i |
| `j` | Sağdaki bölümü tarayan index |
| `temp` | Swap sırasında kaybolmaması için tutulan eski `arr[i]` değeri |

`minIndex = i`: Kalan bölümün ilk elemanı geçici minimum kabul edilir.

`j = i + 1`: Bu elemanı kendisiyle karşılaştırmaya gerek yoktur.

`i < arr.length - 1`: Son eleman, diğerleri yerleşince kendiliğinden doğru konumda kalır.

## `minIndex` örneği

```java
int[] arr = {8, 4, 6, 1, 5};
```

İlk turda `i = 0`:

| Adım | İncelenen değer | `minIndex` | `arr[minIndex]` |
| --- | --- | --- | --- |
| Başlangıç | 8 | 0 | 8 |
| `j = 1` | 4 | 1 | 4 |
| `j = 2` | 6 | 1 | 4 |
| `j = 3` | 1 | 3 | 1 |
| `j = 4` | 5 | 3 | 1 |

Swap sonrası: `[1, 4, 6, 8, 5]`.

> [!important] Index ve değer
> `minIndex = 3`, ama `arr[minIndex] = 1`.
> `minIndex` yalnızca daha küçük bir eleman bulunduğunda güncellenir.

## Laufzeitanalyse

`n` elemanda `arr[j] < arr[minIndex]` karşılaştırmasının sayısı:

$$
C(n)=(n-1)+(n-2)+\dots+1=\frac{n(n-1)}{2}
$$

Bu, [[Java/Algoritmalar/Laufzeitanalyse/Summenformel|Summenformel]] ile hesaplanır. `n = 8` için:

$$
C(8)=\frac{8\cdot7}{2}=\boxed{28}
$$

Diğer döngü ve swap işlemleri de zaman harcar; baskın terim yine `n²`'dir.

| Durum | Karmaşıklık |
| --- | --- |
| Best / Average / Worst | Θ(n²) |
| Ek alan | O(1) |

Array sıralı olsa bile minimum araması devam eder; **karşılaştırma sayısı değişmez**. Standart uygulama in-place çalışır ve stabil değildir.

> [!example]- Klausur-Antwort — Deutsch
> Selection Sort sucht in jedem Durchlauf das kleinste Element im unsortierten Teil des Arrays und vertauscht es mit dem ersten Element dieses Bereichs.
> Die Anzahl der Elementvergleiche beträgt n(n−1)/2. Daher beträgt die Laufzeit im Best, Average und Worst Case Θ(n²). Der zusätzliche Speicherbedarf ist O(1).

[[Java/Algoritmalar/Sıralama/Sıralama Algoritmaları|Sıralama Algoritmaları]] · [[Java/Algoritmalar/Sıralama/Insertion Sort|Insertion Sort]] · [[Java/Algoritmalar/Laufzeitanalyse/Big-O|Big-O]]

