names = []
dim = 3
for col in range(dim):
    for row in range(dim):
        names.append(f"m{col}{row}")

print("constructor(")
i = 0
for name in names:
    print(f"    {name}: number = {1 if i % (dim + 1) == 0 else 0},")
    i = i + 1
print(")")
print()

i = 0
for name in names:
    print(f"get {name}() {{ return this[{i}] }}")
    print(f"set {name}(v: number) {{ this[{i}] = v }}")
    print()
    i = i + 1


