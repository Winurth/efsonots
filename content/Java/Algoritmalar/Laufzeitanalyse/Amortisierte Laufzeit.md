---
title: Amortisierte Laufzeit
tags:
  - java
  - algorithms
  - complexity
---

# Amortisierte Laufzeit

**Amortize analiz**, uzun bir işlem dizisinin toplam maliyetini işlem sayısına bölerek işlem başına maliyeti değerlendirir.

## Dynamic Array örneği

[[Java/Veri Yapıları/Dynamic Arrays|Dynamic Arrays]] için sona ekleme:

- Yer varsa → O(1).
- Resize gerekiyorsa → mevcut elemanlar kopyalanır, O(n).

Kapasite sürekli ikiye katlandığında kopyalanan eleman sayıları şöyle büyür:

$$
1+2+4+8+\dots
$$

Sabit başlangıç kapasiteli, boş bir array'e `m` kez sona ekleme düşünelim. Tüm büyütmelerde kopyalanan eleman sayısı `2m`'den azdır. Her eklemenin kendi sabit maliyetini de eklersek toplam maliyet **O(m)** olur.

İşlem başına:

$$
\frac{O(m)}{m}=O(1)
$$

> [!important] Tek işlem ve işlem dizisi
> Tek bir `add()` hâlâ O(n) sürebilir. **Amortized O(1)**, pahalı büyütmelerin toplam maliyetinin uzun bir ekleme dizisine yayılmasıdır.

Bu analiz rastgele girdi varsaymaz; *Average Case* ile aynı şey değildir.

[[Java/Algoritmalar/Laufzeitanalyse/Big-O|Big-O]] · [[Java/Algoritmalar/Algoritmalar|Algoritmalar]]

