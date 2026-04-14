# -*- coding:utf-8 -*-
import configparser


def get_config(configFileName, sectionName, optionName=None):
    cf = configparser.ConfigParser()
    cf.read(configFileName)
    value = cf.get(sectionName, optionName).strip()
    # print(value)
    return value

