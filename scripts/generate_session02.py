#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
root = Path(__file__).resolve().parent.parent
source = (root / 'scripts/templates/session02.html').read_text(encoding='utf-8')
for name in ['02.html', 'session02.html']:
    (root / 'public' / name).write_text(source, encoding='utf-8')
print('Updated both session 2 documents from the reviewed template.')
