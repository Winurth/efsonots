---
title: Insertion Sort
tags:
  - java
  - algorithms
  - sorting
status: In Progress
---

# Insertion Sort

Sıradaki elemanı (`key`), soldaki **zaten sıralı bölüme** doğru konumda yerleştirir. `key`'den büyük elemanlar sağa kaydırılır.

## Adım adım

Başlangıç: `[5, 2, 7, 3]`.

| Tur | `key` | İşlem | Sonuç |
| --- | --- | --- | --- |
| `i = 1` | 2 | 5 sağa kayar | `[2, 5, 7, 3]` |
| `i = 2` | 7 | Kaydırma gerekmez | `[2, 5, 7, 3]` |
| `i = 3` | 3 | 7 ve 5 sağa kayar | `[2, 3, 5, 7]` |

## Java kodu

```java
public static void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;

        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }

        arr[j + 1] = key;
    }
}
```

## Kodun mantığı

1. `i = 1`: Tek elemanlı sol bölüm zaten sıralıdır.
2. `key = arr[i]`: Yerleştirilecek değer saklanır; kaydırmalarda kaybolmaz.
3. `j = i - 1`: Sol bölümün sağ ucundan başlanır.
4. `arr[j] > key` oldukça eleman sağa kaydırılır ve `j` sola ilerler.
5. Döngü bitince `key`, `arr[j + 1]` konumuna yazılır.

> [!important] Neden önce `j >= 0`?
> Java'da `&&` soldan sağa değerlendirilir. `j` negatifse ikinci koşul çalışmaz; `arr[-1]` erişimi önlenir.

Kaydırma sırasında `key` ayrı değişkende tutulur. Örneğin son tur:

```text
key = 3
[2, 5, 7, 3] → [2, 5, 7, 7] → [2, 5, 5, 7] → [2, 3, 5, 7]
```

## Laufzeit ve özellikler

| Durum | Neden? | Karmaşıklık |
| --- | --- | --- |
| Best Case | Sıralı girdi; kaydırma yok | Θ(n) |
| Average Case | Rastgele sıralanmış farklı değerlerde çok sayıda kaydırma | Θ(n²) |
| Worst Case | Ters sıralı farklı değerlerde her yeni eleman başa gider | Θ(n²) |
| Ek alan | Yalnızca birkaç değişken | O(1) |

Worst Case kaydırma sayısı:

$$
1+2+\dots+(n-1)=\frac{n(n-1)}{2}
$$

Formül: [[Java/Algoritmalar/Laufzeitanalyse/Summenformel|Summenformel]].

Bu uygulama **in-place ve stabildir**. Koşuldaki `>` sayesinde eşit değerler birbirinin önüne geçirilmez.

## Selection Sort ile farkı

[[Java/Algoritmalar/Sıralama/Selection Sort|Selection Sort]] sağdaki bölümün minimumunu seçer. Insertion Sort ise sıradaki elemanı soldaki bölüme yerleştirir; sıralı girdide daha az iş yapar.

[[Java/Algoritmalar/Sıralama/Sıralama Algoritmaları|Sıralama Algoritmaları]] · [[Java/Algoritmalar/Laufzeitanalyse/Big-O|Big-O]]

