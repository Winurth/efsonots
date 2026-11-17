
---

---
tags:
  - algorithms
  - java
status: In Progress
---

---

# PI2 — Grundlagen & Algorithmen

> [!abstract] Konular  
> Dynamic Arrays · Big-O / Laufzeitanalyse · Selection Sort

# 1. Dynamic Arrays

Normal Java Array'lerinin boyutu sabittir. **Dynamic Array**, kapasite dolduğunda daha büyük bir Array oluşturarak büyüyebilir.

### Temel kavramlar

|Kavram|Açıklama|
|---|---|
|`size`|Şu anda bulunan eleman sayısı|
|`capacity`|Ayrılmış toplam alan|
|`index`|Elemanın konumu (0'dan başlar)|
|`resize`|Kapasiteyi büyütme işlemi|

### Array nasıl büyür?

Örneğin kapasite dolduğunda ikiye katlama stratejisi kullanılıyorsa:

```java
Capacity = 4, Size = 4

[10, 20, 30, 40]

add(50) → Capacity = 8

[10, 20, 30, 40, 50, _, _, _]
```

Büyütme işlemi:

1. İki kat kapasiteli yeni Array oluşturulur.
    
2. Eski elemanlar yeni Array'e kopyalanır.
    
3. Yeni eleman eklenir.
    

### Laufzeit

|İşlem|Karmaşıklık|
|---|---|
|Index ile erişim|O(1)|
|Boş yer varken `add()`|O(1)|
|Resize gerektiren `add()`|O(n)|
|Amortized `add()` (doubling)|O(1)|

> [!important] Amortisierte Laufzeit  
> Tek bir ekleme O(n) sürebilir. Ancak kapasite sürekli ikiye katlandığında uzun bir ekleme dizisinde işlem başına **amortized O(1)** maliyet elde edilir.

---

# 2. Big-O — Laufzeitanalyse

Big-O, girdi büyüklüğü (`n`) arttıkça algoritmanın işlem maliyetinin nasıl büyüdüğünü ifade eder.

## Temel karmaşıklıklar

|Big-O|Almancası|Örnek|
|---|---|---|
|O(1)|Konstant|`arr[0]`|
|O(log n)|Logarithmisch|Her turda ikiye katlama|
|O(n)|Linear|Tek `for` döngüsü|
|O(n log n)|Linearithmisch|İç içe lineer ve logaritmik döngü|
|O(n²)|Quadratisch|İki iç içe lineer döngü|

## 2.1 O(1) — Constant

```java
int x = arr[0];
```

Girdi büyüklüğünden bağımsız, sabit maliyet.

## 2.2 O(n) — Linear

```java
for (int i = 0; i < n; i++) {
    System.out.println(i);
}
```

Döngü `n` kez çalışır.

## 2.3 O(log n) — Logarithmic

```java
for (int i = 1; i < n; i *= 2) {
    System.out.println(i);
}
```

`n = 16` için:

```
1 → 2 → 4 → 8 → STOP
```

4 tekrar.

Genel tekrar sayısı (`n ≥ 1`):

$$  
T(n)=\lceil\log_2 n\rceil  
$$

## 2.4 O(n²) — Quadratic

```java
for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
        System.out.println("Hello");
    }
}
```

Her dış döngüde iç döngü `n` kez çalışır.

$$  
T(n)=n\cdot n=n^2  
$$

## 2.5 O(n log n)

```java
for (int i = 0; i < n; i++) {
    for (int j = 1; j < n; j *= 2) {
        System.out.println("Hello");
    }
}
```

Dış döngü: O(n)

İç döngü: O(log n)

Döngüler iç içeyse çarpılır. Yani:

$$  
O(n\log n)  
$$
olur. Detay -->
## 2.6 Döngülerde toplama ve çarpma

**Arka arkaya döngüler (nacheinander):**

```java
for (int i = 0; i < n; i++) { }

for (int j = 1; j < n; j *= 2) { }
```

$$  
O(n+\log n)=O(n)  
$$

**İç içe döngüler (verschachtelt):**

```java
for (int i = 0; i < n; i++) {
    for (int j = 1; j < n; j *= 2) { }
}
```

$$  
O(n\log n)  
$$

> [!tip] Klausur-Regel
> 
> - Arka arkaya işlemler → maliyetleri topla.
>     
> - Bağımsız iç içe döngüler → tekrar sayılarını çarp.
>     
> - İç döngünün sınırı dış değişkene bağlıysa → toplam (Summe) hesapla.
>     
> 
> İç içe döngüler her zaman O(n²) değildir!

## 2.7 Summenformel

İç döngünün `j < i` veya `j <= i` olması sonucu değiştirir.

**Durum A —** `**j < i**`**:**

```java
for (int i = 0; i < n; i++) {
    for (int j = 0; j < i; j++) { }
}
```

$$  
T(n)=0+1+2+\ldots+(n-1)  
$$

$$  
\boxed{T(n)=\frac{n(n-1)}{2}}  
$$

**Durum B —** `**j <= i**`**:**

```java
for (int i = 0; i < n; i++) {
    for (int j = 0; j <= i; j++) { }
}
```

$$  
T(n)=1+2+3+\ldots+n  
$$

$$  
\boxed{T(n)=\frac{n(n+1)}{2}}  
$$

Her iki durumda da:

$$  
O(n^2)  
$$

## 2.8 Big-O sadeleştirme

Big-O için baskın (en hızlı büyüyen) terimi tutarız, sabit çarpanları ve daha düşük dereceli terimleri atarız.

Örnek:

$$  
T(n)=\frac{n(n-1)}{2}+3n  
$$

$$  
=\frac{n^2-n+6n}{2}  
$$

$$  
=\frac{n^2+5n}{2}  
$$

$$  
\boxed{O(n^2)}  
$$

> [!warning] Dikkat
> 
> - `T(n)` → işlem sayısı / maliyet fonksiyonu
>     
> - `O(...)` → asimptotik üst sınır
>     
> - `Θ(...)` → asimptotik sıkı sınır
>     
> 
> Gerçek işlem sayısını O(n²) şeklinde yazmayız. Örneğin `T(8) = 28`, ancak karmaşıklık `O(n²)` olabilir.

---

# 3. Selection Sort

**Selection Sort**, her turda sıralanmamış bölümdeki en küçük elemanı bulup o bölümün ilk elemanıyla yer değiştiren (swap) sıralama algoritmasıdır.

## 3.1 Algoritmanın mantığı

Başlangıç:

```java
[7, 5, 9, 2, 3]
```

|Tur|Array|Yapılan işlem|
|---|---|---|
|0|`[7, 5, 9, 2, 3]`|Başlangıç|
|1|`[2, 5, 9, 7, 3]`|7 ↔ 2|
|2|`[2, 3, 9, 7, 5]`|5 ↔ 3|
|3|`[2, 3, 5, 7, 9]`|9 ↔ 5|
|4|`[2, 3, 5, 7, 9]`|7 zaten doğru yerde|

Her turdan sonra soldaki sıralanmış bölüm bir eleman büyür.

## 3.2 Java Implementation

```java
public static void selectionSort(int[] arr) {

    for (int i = 0; i < arr.length - 1; i++) {

        int minIndex = i;

        // Find minimum
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }

        // Swap
        int temp = arr[i];
        arr[i] = arr[minIndex];
        arr[minIndex] = temp;
    }
}
```

### Kodun açıklaması

**1. Outer Loop —** `**i**`

```java
for (int i = 0; i < arr.length - 1; i++)
```

- Sıralanacak konumu belirler.
    
- Her turda sıralanmış bölüm büyür.
    
- Son eleman otomatik olarak doğru konumda kalacağı için `length - 1` yeterlidir.

Yani array'in ilk elemanından = arr[0] başlar, onu ilk olarak minimum Index olarak kabul eder sonra iç döngü(Inner loop) çalışır. ->


**2. Minimum Index**

```java
int minIndex = i;
```

Henüz taranmamış bölümün ilk elemanını geçici minimum kabul eder.

> [!important] `minIndex` vs. `arr[minIndex]`
> 
> - `minIndex` = minimum elemanın index'i.
>     
> - `arr[minIndex]` = minimum elemanın değeri.
>     

**3. Inner Loop —** `**j**`

```java
for (int j = i + 1; j < arr.length; j++) {
    if (arr[j] < arr[minIndex]) {
        minIndex = j;
    }
}
```

Kalan elemanlar tek tek karşılaştırılır. Daha küçük bir değer bulunursa `minIndex` güncellenir. 


**4. Swap**

```java
int temp = arr[i];
arr[i] = arr[minIndex];
arr[minIndex] = temp;
```

`temp` değişkeni sayesinde iki değer kaybolmadan yer değiştirir.

## 3.3 `minIndex` örneği

```java
int[] arr = {8, 4, 6, 1, 5};
```

İlk turda `i = 0`:

|j|arr[j]|minIndex|
|---|---|---|
|Başlangıç|8|0|
|1|4|1|
|2|6|1|
|3|1|3|
|4|5|3|

Sonuç:

```java
minIndex = 3
arr[minIndex] = 1

Swap: arr[0] ↔ arr[3]

[1, 4, 6, 8, 5]
```

**Önemli:** `minIndex` her karşılaştırmada değişmez. Yalnızca daha küçük bir eleman bulunduğunda güncellenir.

---

## 3.4 Selection Sort — Laufzeitanalyse

```java
for (int i = 0; i < arr.length - 1; i++) {
    int minIndex = i;

    for (int j = i + 1; j < arr.length; j++) {
        if (arr[j] < arr[minIndex]) {
            minIndex = j;
        }
    }
}
```

Array uzunluğu `n` ise:

- İlk turda `n−1` karşılaştırma.
    
- İkinci turda `n−2` karşılaştırma.
    
- Üçüncü turda `n−3` karşılaştırma.
    
- Son turda 1 karşılaştırma.
    

Toplam eleman karşılaştırma sayısı:

$$  
T(n)=(n-1)+(n-2)+\ldots+1  
$$

Summenformel kullanılır:

$$  
\boxed{T(n)=\frac{n(n-1)}{2}}  
$$

Parantezi açalım:

$$  
T(n)=\frac{n^2-n}{2}  
$$

Baskın terim `n²` olduğu için:

$$  
\boxed{O(n^2)}  
$$

Bu formül `arr[j] < arr[minIndex]` karşılaştırmalarını sayar. Diğer döngü ve swap işlemleri de toplam zaman maliyetine katkıda bulunur, ancak karmaşıklık sınıfını değiştirmez.

### Örnek: n = 8

$$  
T(8)=\frac{8(8-1)}{2}  
$$

$$  
=\frac{8\cdot7}{2}=\boxed{28}  
$$

**28 eleman karşılaştırması yapılır.**

## 3.5 Best, Average & Worst Case

Standart Selection Sort, Array zaten sıralı olsa bile minimum aramaya devam eder.

|Durum|Time Complexity|
|---|---|
|Best Case|Θ(n²)|
|Average Case|Θ(n²)|
|Worst Case|Θ(n²)|
|Extra Space|O(1)|

- **In-place:** Ek bir Array oluşturmadan sıralar.
    
- **Nicht stabil (standart uygulama):** Eşit değerlerin başlangıçtaki göreli sırası korunmayabilir.
    
- Girdi sırası, karşılaştırma sayısını değiştirmez.
    

> [!example] Klausur-Antwort (Deutsch)  
> Selection Sort sucht in jedem Durchlauf das kleinste Element im unsortierten Teil des Arrays und vertauscht es mit dem ersten Element dieses Bereichs.
> 
> Die Anzahl der Vergleiche beträgt:
> 
> $$  
> \frac{n(n-1)}{2}  
> $$
> 
> Daher beträgt