---
title: Dynamic Arrays
tags:
  - java
  - data-structures
---

# Dynamic Arrays

Normal Java array'lerinin uzunluğu sabittir. **Dynamic Array**, kapasite dolunca daha büyük bir array oluşturup elemanları oraya kopyalar.

## Temel kavramlar

| Kavram | Anlamı |
| --- | --- |
| `size` | Şu anda saklanan eleman sayısı |
| `capacity` | Ayrılmış toplam eleman kapasitesi |
| `index` | Elemanın konumu; 0'dan başlar |
| `resize` | Daha büyük bir array'e geçme işlemi |

## Kapasite nasıl büyür?

Kapasiteyi ikiye katlama (*doubling*) örneği:

```text
capacity = 4, size = 4
[10, 20, 30, 40]

add(50)

capacity = 8, size = 5
[10, 20, 30, 40, 50, _, _, _]
```

1. İki kat kapasiteli yeni array oluşturulur.
2. Eski elemanlar kopyalanır.
3. Yeni eleman eklenir; `size` bir artar.

> [!important] `size` ve `capacity` aynı değildir
> Örnekte 5 eleman var, ama toplam 8 elemanlık yer ayrılmış durumda.

## Laufzeit

`n`, o anda saklanan eleman sayısı olsun. `add()` burada **sona ekleme** anlamındadır.

| İşlem | Maliyet |
| --- | --- |
| Index ile erişim | O(1) |
| Boş yer varken `add()` | O(1) |
| Resize gerektiren `add()` | O(n) |
| Doubling ile amortized `add()` | O(1) |

Tek bir eklemenin O(n), uzun bir ekleme dizisindeki işlem başına maliyetin O(1) olmasının nedeni: [[Java/Algoritmalar/Laufzeitanalyse/Amortisierte Laufzeit|Amortisierte Laufzeit]].

[[Java/Veri Yapıları/Veri Yapıları|Veri Yapıları]] · [[Java/Algoritmalar/Laufzeitanalyse/Big-O|Big-O]]

